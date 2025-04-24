
import Stripe from 'https://esm.sh/stripe@13.6.0'
import { updateSubscriptionStatus } from '../subscriptionService.ts'

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  await updateSubscriptionStatus(
    subscription.customer as string,
    'free',
    null
  )
}
