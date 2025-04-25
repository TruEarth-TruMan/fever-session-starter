
import { supabase } from './config.ts'

// Function to update subscription status in the database
export async function updateSubscriptionStatus(
  customerId: string,
  subscriptionTier: string,
  subscriptionEnd: string | null
) {
  try {
    console.log(`Updating subscription for customer ${customerId} to tier ${subscriptionTier}`)
    
    // First, check if a profile with this customer ID exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select()
      .eq('stripe_customer_id', customerId)
      .single()
      
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        console.log(`No profile found for stripe_customer_id: ${customerId}. Will attempt to find by email.`)
        
        // Try to get customer email from Stripe API
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
        if (!stripeSecretKey) {
          throw new Error('STRIPE_SECRET_KEY is not set')
        }
        
        // Fetch customer data from Stripe to get email
        const response = await fetch(`https://api.stripe.com/v1/customers/${customerId}`, {
          headers: {
            'Authorization': `Bearer ${stripeSecretKey}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch customer from Stripe: ${response.status} ${await response.text()}`)
        }
        
        const customer = await response.json()
        if (!customer.email) {
          throw new Error(`No email found for Stripe customer: ${customerId}`)
        }
        
        console.log(`Found email ${customer.email} for customer ${customerId}, checking for profile...`)
        
        // Try to find profile by email
        const { data: profileByEmail, error: emailFetchError } = await supabase
          .from('profiles')
          .select()
          .eq('email', customer.email)
          .maybeSingle() // Use maybeSingle instead of single to avoid errors when no match is found
          
        if (emailFetchError) {
          console.error('Error looking up profile by email:', emailFetchError)
          throw emailFetchError
        }

        if (profileByEmail) {
          // If profile exists, update it
          console.log(`Found profile for email ${customer.email}, updating...`)
          const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({
              stripe_customer_id: customerId,
              subscription_tier: subscriptionTier,
              subscription_end: subscriptionEnd,
              fever_plus: subscriptionTier !== 'free',
            })
            .eq('id', profileByEmail.id)
            .select()
            .single()
            
          if (updateError) {
            console.error('Error updating profile by email:', updateError)
            throw updateError
          }
          
          console.log('Successfully updated profile by email:', updatedProfile)
          await logSubscriptionEvent(customerId, subscriptionTier, subscriptionEnd, updatedProfile?.id)
          return updatedProfile
        } else {
          // If profile doesn't exist yet, create a new one
          console.log(`No existing profile found for email ${customer.email}, creating new profile...`)
          
          // Generate a UUID for the new profile
          const newProfileId = crypto.randomUUID()
          
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: newProfileId,
              email: customer.email,
              stripe_customer_id: customerId,
              subscription_tier: subscriptionTier,
              subscription_end: subscriptionEnd,
              fever_plus: subscriptionTier !== 'free',
              created_at: new Date().toISOString()
            })
            .select()
            .single()
            
          if (insertError) {
            console.error('Error creating new profile:', insertError)
            throw insertError
          }
          
          console.log('Successfully created new profile:', newProfile)
          await logSubscriptionEvent(customerId, subscriptionTier, subscriptionEnd, newProfile?.id)
          return newProfile
        }
      } else {
        console.error('Error fetching profile:', fetchError)
        throw fetchError
      }
    }
    
    // If profile exists, update it
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: subscriptionTier,
        subscription_end: subscriptionEnd,
        fever_plus: subscriptionTier !== 'free',
      })
      .eq('stripe_customer_id', customerId)
      .select()
      .single()
      
    if (error) {
      console.error('Error updating subscription in database:', error)
      throw error
    }
    
    console.log('Successfully updated subscription for existing profile:', profile)
    await logSubscriptionEvent(customerId, subscriptionTier, subscriptionEnd, profile?.id)
    return profile
  } catch (error) {
    console.error('Error updating subscription status:', error)
    throw error
  }
}

// Helper function to log subscription events
async function logSubscriptionEvent(
  customerId: string,
  subscriptionTier: string,
  subscriptionEnd: string | null,
  profileId?: string
) {
  try {
    await supabase.from('subscription_events').insert({
      stripe_customer_id: customerId,
      subscription_tier: subscriptionTier,
      event_type: subscriptionEnd ? 'subscription_updated' : 'subscription_created',
      details: { profile_id: profileId, subscription_end: subscriptionEnd },
      user_id: profileId
    })
    console.log('Successfully logged subscription event')
  } catch (logError) {
    console.error('Failed to log subscription event:', logError)
    // Don't throw here to avoid interrupting the main flow
  }
}
