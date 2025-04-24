import Stripe from 'https://esm.sh/stripe@13.6.0'

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  try {
    console.log('🔔 Checkout session received in handler')
    console.log('🧾 Full session object:', JSON.stringify(session, null, 2))

    // Log basic fields we expect
    console.log('💳 Customer ID:', session.customer)
    console.log('📦 Subscription ID:', session.subscription)

    // (Temporarily skip any Supabase DB updates or logic for now)
    // This will help isolate whether the problem is logic inside this handler or not.

    console.log('✅ Checkout handler completed successfully')
  } catch (error) {
    console.error('❌ Error in checkoutCompleted handler:', error)
    throw error  // Re-throw so Supabase reports it
  }
}
