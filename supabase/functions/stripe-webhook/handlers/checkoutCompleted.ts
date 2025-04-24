
import Stripe from 'https://esm.sh/stripe@13.6.0'
import { updateSubscriptionStatus } from '../subscriptionService.ts'

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  console.log('🔔 Handling checkout.session.completed event', {
    customerId: session.customer,
    subscriptionId: session.subscription
  });

  try {
    if (!session.customer || !session.subscription) {
      console.error('❌ Missing customer or subscription in checkout session', session);
      return;
    }

    const customerId = typeof session.customer === 'string' 
      ? session.customer 
      : session.customer.id;
    
    const subscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription.id;

    console.log(`🔍 Processing checkout for customer ${customerId} and subscription ${subscriptionId}`);
    
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }

    console.log('🔍 Fetching subscription details from Stripe API');
    const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch subscription: ${response.status} ${errorText}`);
    }

    const subscription = await response.json();
    console.log('✅ Successfully fetched subscription details', {
      status: subscription.status,
      items: subscription.items?.data?.length || 0
    });

    // Extract the subscription tier from the price lookup_key or fallback to a default
    const subscriptionTier = subscription.items?.data[0]?.price?.lookup_key || 'fever_plus';
    
    // Calculate subscription end date if available
    const subscriptionEnd = subscription.cancel_at 
      ? new Date(subscription.cancel_at * 1000).toISOString() 
      : null;

    // Update the user's subscription status
    await updateSubscriptionStatus(
      customerId,
      subscriptionTier,
      subscriptionEnd
    );
    
    console.log('✅ Successfully updated subscription status');
  } catch (error) {
    console.error('❌ Error handling checkout.session.completed event:', error);
    throw error; // Re-throw to ensure the error is properly logged
  }
}
