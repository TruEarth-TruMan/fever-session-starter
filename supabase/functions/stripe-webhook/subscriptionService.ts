
import { supabase } from './config.ts'

// Function to update subscription status in the database
export async function updateSubscriptionStatus(
  customerId: string,
  subscriptionTier: string,
  subscriptionEnd: string | null
) {
  try {
    console.log(`Updating subscription for customer ${customerId} to tier ${subscriptionTier}`)
    
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
      console.error('Error updating subscription in database:', error)
      throw error
    }
    
    // Log the successful update
    await supabase.from('subscription_events').insert({
      stripe_customer_id: customerId,
      subscription_tier: subscriptionTier,
      event_type: subscriptionEnd ? 'subscription_updated' : 'subscription_cancelled',
      details: { profile_id: profile?.id, subscription_end: subscriptionEnd }
    })
    
    return profile
  } catch (error) {
    console.error('Error updating subscription status:', error)
    throw error
  }
}
