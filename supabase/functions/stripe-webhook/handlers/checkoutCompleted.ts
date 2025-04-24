
import Stripe from 'https://esm.sh/stripe@13.6.0'
import { updateSubscriptionStatus } from '../subscriptionService.ts'

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  if (session.customer && session.subscription) {
    const subscription = await fetch('https://api.stripe.com/v1/subscriptions/' + session.subscription, {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')}`,
      },
    }).then(res => res.json())

    await updateSubscriptionStatus(
      session.customer as string,
      subscription.items.data[0].price.lookup_key || 'fever_plus',
      subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null
    )
  }
}
