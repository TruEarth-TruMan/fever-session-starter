
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import Stripe from 'https://esm.sh/stripe@13.6.0'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')
const SUPABASE_URL = "https://vdlmwlqsexisiwokinqb.supabase.co"
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const stripe = new Stripe(STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY!)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

async function updateSubscriptionStatus(
  customerId: string,
  subscriptionTier: string,
  subscriptionEnd: string | null
) {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .update({
        subscription_tier: subscriptionTier,
        subscription_end: subscriptionEnd,
      })
      .eq('stripe_customer_id', customerId)
      .select()
      .single()

    return profile
  } catch (error) {
    console.error('Error updating subscription status:', error)
    throw error
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      await logWebhookEvent({ type: 'webhook.missing_signature', data: { object: {} } } as Stripe.Event, false, 'Missing stripe-signature header')
      return new Response('Missing stripe-signature header', { status: 400 })
    }

    const body = await req.text()
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET!
      )
    } catch (err) {
      await logWebhookEvent({ type: 'webhook.validation_error', data: { object: {} } } as Stripe.Event, false, err.message)
      return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    console.log(`Processing Stripe event: ${event.type}`)

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
    }

    // Log the successful webhook event
    await logWebhookEvent(event, true)

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error processing webhook:', error)
    
    // Log the failed webhook event with error details
    await logWebhookEvent(
      { type: 'webhook.processing_error', data: { object: {} } } as Stripe.Event, 
      false, 
      error.message
    )

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
