
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@13.6.0"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
    if (!STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
    }

    // Initialize Stripe
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })

    // Initialize Supabase client with the service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get the session ID from query params
    const url = new URL(req.url)
    const sessionId = url.searchParams.get('session_id')
    
    // Check authorization (this ensures only authenticated users can access session details)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Not authorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Authentication failed', details: authError }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // Validate session ID
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Missing session_id parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`Fetching Stripe session: ${sessionId}`)
    
    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'subscription']
    })

    const customerEmail = session.customer_email || (session.customer ? 
      typeof session.customer === 'string' ? 
        null : session.customer.email : null)
    
    if (!customerEmail) {
      console.warn(`No customer email found for session ${sessionId}`)
    }
    
    // If customer email matches current user, update their profile
    if (customerEmail && customerEmail === user.email) {
      console.log(`Updating profile for user ${user.id} with email ${customerEmail}`)
      
      // Determine subscription tier from price lookup_key or product name
      let subscriptionTier = 'free'
      let subscriptionEnd: string | null = null
      
      if (session.subscription) {
        const subscription = typeof session.subscription === 'string' ?
          await stripe.subscriptions.retrieve(session.subscription) : 
          session.subscription
          
        const item = subscription.items?.data[0]
        if (item?.price?.lookup_key) {
          subscriptionTier = item.price.lookup_key
        } else if (item?.price?.product) {
          // Fallback to product name if lookup_key not available
          const productId = typeof item.price.product === 'string' ? 
            item.price.product : item.price.product.id
          
          const product = await stripe.products.retrieve(productId)
          subscriptionTier = product.name.toLowerCase().includes('premium') ? 
            'premium' : (product.name.toLowerCase().includes('fever_plus') ? 'fever_plus' : 'free')
        }
        
        // Calculate subscription end if available
        if (subscription.cancel_at) {
          subscriptionEnd = new Date(subscription.cancel_at * 1000).toISOString()
        } else if (subscription.current_period_end) {
          subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString()
        }
      }
      
      // Update or create the user profile with subscription details
      const { data: profile, error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          stripe_customer_id: typeof session.customer === 'string' ? 
            session.customer : session.customer?.id,
          subscription_tier: subscriptionTier,
          subscription_end: subscriptionEnd,
          fever_plus: subscriptionTier !== 'free',
        }, { onConflict: 'id' })
        .select()
        .single()
      
      if (updateError) {
        console.error('Error updating profile:', updateError)
        // Continue providing session details even if profile update fails
      } else {
        console.log('Profile updated successfully')
      }
    } else if (customerEmail) {
      console.log(`User email (${user.email}) doesn't match customer email (${customerEmail})`)
    }
    
    // Create a sanitized response without sensitive data
    const sanitizedSession = {
      id: session.id,
      customer_email: customerEmail,
      subscription_status: session.subscription ? 
        (typeof session.subscription === 'string' ? 'active' : session.subscription.status) : 
        null,
      subscription_tier: session.subscription ?
        (typeof session.subscription === 'string' ? null : 
          session.subscription.items?.data[0]?.price?.lookup_key || 'fever_plus') :
        null,
      success: true,
    }

    return new Response(JSON.stringify(sanitizedSession), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
    
  } catch (error) {
    console.error('Error in get-session-details function:', error)
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
