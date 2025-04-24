
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

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }

    console.log('🔍 Fetching subscription details from Stripe API');
    const response = await fetch(`https://api.stripe.com/v1/subscriptions/${session.subscription}`, {
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

    // Extract the subscription details and update the user's subscription status
    await updateSubscriptionStatus(
      session.customer as string,
      subscription.items.data[0]?.price?.lookup_key || 'fever_plus',
      subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null
    );
    
    console.log('✅ Successfully updated subscription status');
  } catch (error) {
    console.error('❌ Error handling checkout.session.completed event:', error);
    throw error; // Re-throw to ensure the error is properly logged
  }
}
