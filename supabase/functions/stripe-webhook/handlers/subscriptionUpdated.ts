
import Stripe from 'https://esm.sh/stripe@13.6.0'
import { updateSubscriptionStatus } from '../subscriptionService.ts'

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  await updateSubscriptionStatus(
    subscription.customer as string,
    subscription.items.data[0].price.lookup_key || 'fever_plus',
    subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null
  )
}
