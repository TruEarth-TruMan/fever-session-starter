import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import Stripe from 'https://esm.sh/stripe@13.6.0'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')
const SUPABASE_URL = "https://vdlmwlqsexisiwokinqb.supabase.co"
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// Initialize Stripe client
const stripe = new Stripe(STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY!)

// CORS headers with explicit stripe-signature support
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

// Debug mode for testing
const DEBUG_MODE = true

// Function to log webhook events to the database
async function logWebhookEvent(event: Stripe.Event, success: boolean, errorMessage?: string) {
  try {
    const customer = event.data.object as { email?: string, customer?: string }
    await supabase.from('stripe_webhook_logs').insert({
      event_type: event.type,
      payload: event.data.object,
      success: success,
      error_message: errorMessage || null,
      customer_id: customer.customer || null,
      customer_email: customer.email || null
    })
  } catch (logError) {
    console.error('Failed to log webhook event:', logError)
  }
}

// Enhanced request logging function
async function logRequestDetails(request: Request, status: string, details?: any) {
  try {
    const logDetails = {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
      details: details || {},
      timestamp: new Date().toISOString(),
      debug_mode: DEBUG_MODE
    };
    
    console.log(`Webhook ${status}:`, JSON.stringify(logDetails));
    
    // Log to database for persistence
    await supabase.from('stripe_webhook_logs').insert({
      event_type: `debug.${status}`,
      payload: logDetails,
      success: status === 'success',
      error_message: status.includes('error') ? JSON.stringify(details) : null,
    });
  } catch (error) {
    console.error('Error logging request details:', error);
  }
}

// Function to update subscription status in the database
async function updateSubscriptionStatus(
  customerId: string,
  subscriptionTier: string,
  subscriptionEnd: string | null
) {
  try {
    console.log(`Updating subscription for customer ${customerId} to tier ${subscriptionTier}`);
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: subscriptionTier,
        subscription_end: subscriptionEnd,
      })
      .eq('stripe_customer_id', customerId)
      .select()
      .single()
      
    if (error) {
      console.error('Error updating subscription in database:', error);
      throw error;
    }
    
    // Log the successful update
    await supabase.from('subscription_events').insert({
      stripe_customer_id: customerId,
      subscription_tier: subscriptionTier,
      event_type: subscriptionEnd ? 'subscription_updated' : 'subscription_cancelled',
      details: { profile_id: profile?.id, subscription_end: subscriptionEnd }
    });
    
    return profile
  } catch (error) {
    console.error('Error updating subscription status:', error)
    throw error
  }
}

async function handler(req: Request): Promise<Response> {
  // Initial request received log with secret verification
  await logRequestDetails(req, 'received', {
    stripe_key_exists: !!STRIPE_SECRET_KEY,
    webhook_secret_exists: !!STRIPE_WEBHOOK_SECRET,
    webhook_secret_preview: STRIPE_WEBHOOK_SECRET ? `${STRIPE_WEBHOOK_SECRET.slice(0, 10)}...` : 'not set'
  });

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Debug mode check
  if (DEBUG_MODE && req.url.includes('debug=true')) {
    const body = await req.text();
    await logRequestDetails(req, 'debug_mode', {
      body_length: body.length,
      body_preview: body.slice(0, 100) + '...',
      headers: Object.fromEntries(req.headers.entries())
    });
    return new Response(JSON.stringify({ debug: true, received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  }

  try {
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      console.error('⚠️ Missing stripe-signature header');
      await logRequestDetails(req, 'error', { message: 'Missing stripe-signature header' });
      return new Response('Missing stripe-signature header', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    // Get the raw request body for signature verification
    const body = await req.text()
    
    // Enhanced logging before signature verification
    console.log('🔍 Verifying signature with:', {
      bodyLength: body.length,
      signaturePreview: signature.slice(0, 20) + '...',
      webhookSecretPreview: STRIPE_WEBHOOK_SECRET ? `${STRIPE_WEBHOOK_SECRET.slice(0, 10)}...` : 'not set'
    });

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET!
      )
      await logRequestDetails(req, 'signature_verified', { 
        eventType: event.type,
        eventId: event.id 
      });
    } catch (err) {
      console.error('⚠️ Signature verification failed:', err.message);
      console.error('Webhook secret used:', STRIPE_WEBHOOK_SECRET?.slice(0, 10) + '...');
      await logRequestDetails(req, 'signature_verification_failed', {
        error: err.message,
        webhookSecretPreview: STRIPE_WEBHOOK_SECRET ? `${STRIPE_WEBHOOK_SECRET.slice(0, 10)}...` : 'not set',
        signaturePreview: signature.slice(0, 20) + '...',
        bodyPreview: body.slice(0, 100) + '...'
      });
      return new Response(`Webhook Error: ${err.message}`, { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    console.log(`Processing Stripe event: ${event.type}`)
    await logRequestDetails(req, 'processing', { eventType: event.type });

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.customer && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          await updateSubscriptionStatus(
            session.customer as string,
            subscription.items.data[0].price.lookup_key || 'fever_plus',
            subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null
          )
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await updateSubscriptionStatus(
          subscription.customer as string,
          subscription.items.data[0].price.lookup_key || 'fever_plus',
          subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null
        )
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await updateSubscriptionStatus(
          subscription.customer as string,
          'free',
          null
        )
        break
      }
      
      default: {
        console.log(`Unhandled event type: ${event.type}`)
        await logRequestDetails(req, 'unhandled_event', { eventType: event.type });
      }
    }

    // Log the successful webhook event
    await logWebhookEvent(event, true)
    await logRequestDetails(req, 'success', { eventType: event.type });

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error processing webhook:', error)
    await logRequestDetails(req, 'error', { 
      message: error.message, 
      stack: error.stack 
    });
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}

// Use Deno.serve with disabled body parsing
Deno.serve({ onRequest: handler, onParseBody: false })
