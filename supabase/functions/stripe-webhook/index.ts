
import Stripe from 'https://esm.sh/stripe@13.6.0'
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, corsHeaders, DEBUG_MODE } from './config.ts'
import { logWebhookEvent, logRequestDetails } from './logging.ts'
import { handleCheckoutCompleted } from './handlers/checkoutCompleted.ts'
import { handleSubscriptionUpdated } from './handlers/subscriptionUpdated.ts'
import { handleSubscriptionDeleted } from './handlers/subscriptionDeleted.ts'

// Initialize Stripe client
const stripe = new Stripe(STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

async function handler(req: Request): Promise<Response> {
  // Initial request received log with secret verification
  await logRequestDetails(req, 'received', {
    stripe_key_exists: !!STRIPE_SECRET_KEY,
    webhook_secret_exists: !!STRIPE_WEBHOOK_SECRET,
    webhook_secret_preview: STRIPE_WEBHOOK_SECRET ? `${STRIPE_WEBHOOK_SECRET.slice(0, 10)}...` : 'not set'
  })

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Debug mode check
  if (DEBUG_MODE && req.url.includes('debug=true')) {
    const body = await req.text()
    await logRequestDetails(req, 'debug_mode', {
      body_length: body.length,
      body_preview: body.slice(0, 100) + '...',
      headers: Object.fromEntries(req.headers.entries())
    })
    return new Response(JSON.stringify({ debug: true, received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  }

  try {
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      console.error('⚠️ Missing stripe-signature header')
      await logRequestDetails(req, 'error', { message: 'Missing stripe-signature header' })
      return new Response('Missing stripe-signature header', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    // Get the raw request body for signature verification
    const bodyBuffer = await req.arrayBuffer()
    const bodyText = new TextDecoder('utf-8').decode(bodyBuffer)
    
    // Enhanced logging before signature verification
    console.log('🔍 Verifying signature with:', {
      bodyLength: bodyText.length,
      signaturePreview: signature.slice(0, 20) + '...',
      webhookSecretPreview: STRIPE_WEBHOOK_SECRET ? `${STRIPE_WEBHOOK_SECRET.slice(0, 10)}...` : 'not set'
    })

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        bodyText,
        signature,
        STRIPE_WEBHOOK_SECRET!
      )
      await logRequestDetails(req, 'signature_verified', { 
        eventType: event.type,
        eventId: event.id 
      })
    } catch (err) {
      console.error('⚠️ Signature verification failed:', err.message)
      console.error('Webhook secret used:', STRIPE_WEBHOOK_SECRET?.slice(0, 10) + '...')
      await logRequestDetails(req, 'signature_verification_failed', {
        error: err.message,
        webhookSecretPreview: STRIPE_WEBHOOK_SECRET ? `${STRIPE_WEBHOOK_SECRET.slice(0, 10)}...` : 'not set',
        signaturePreview: signature.slice(0, 20) + '...',
        bodyPreview: bodyText.slice(0, 100) + '...'
      })
      return new Response(`Webhook Error: ${err.message}`, { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    console.log(`Processing Stripe event: ${event.type}`)
    await logRequestDetails(req, 'processing', { eventType: event.type })

    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      }

      case 'customer.subscription.updated': {
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      }

      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      }
      
      default: {
        console.log(`Unhandled event type: ${event.type}`)
        await logRequestDetails(req, 'unhandled_event', { eventType: event.type })
      }
    }

    // Log the successful webhook event
    await logWebhookEvent(event, true)
    await logRequestDetails(req, 'success', { eventType: event.type })

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error processing webhook:', error)
    await logRequestDetails(req, 'error', { 
      message: error.message, 
      stack: error.stack 
    })
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}

// Fix: Properly use Deno.serve with the handler function
Deno.serve({ port: 8000 }, handler)
