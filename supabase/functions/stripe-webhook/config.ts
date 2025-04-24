
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

export const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
export const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')
export const SUPABASE_URL = "https://vdlmwlqsexisiwokinqb.supabase.co"
export const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
export const DEBUG_MODE = true

// CORS headers with explicit stripe-signature support
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY!)
