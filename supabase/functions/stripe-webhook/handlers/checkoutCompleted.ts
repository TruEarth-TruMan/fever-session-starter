import Stripe from 'https://esm.sh/stripe@13.6.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '../config.ts'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY!)

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    if (!session.customer || !session.subscription) {
      console.warn('Missing customer or subscription ID in session:', session.id)
      return
    }

    const customerId = session.customer as string
    const subscriptionId = session.subscription as string

    // Fetch subscription details from Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    const subscriptionTier = subscription.items.data[0].price.lookup_key || 'fever_plus'
    const cancelAt = subscription.cancel_at
      ? new Date(subscription.cancel_at * 1000).toISOString()
      : null

    // Update Supabase user profile
    const { error, data } = await supabase
      .from('profiles')
      .update({
        subscription_tier: subscriptionTier,
        subscription_end: cancelAt,
      })
      .eq('stripe_customer_id', customerId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update Supabase profile: ${error.message}`)
    }

    // Optional: log event to 'subscription_events'
    await supabase.from('subscription_events').insert({
      stripe_customer_id: customerId,
      subscription_tier: subscriptionTier,
      event_type: 'checkout.session.completed',
      details: {
        session_id: session.id,
        subscription_id: subscriptionId,
        cancel_at: cancelAt,
      }
    })

    console.log('✅ Subscription info updated in Supabase:', data)
  } catch (err) {
    console.error('❌ handleCheckoutCompleted failed:', err.message)
    throw err
  }
}
