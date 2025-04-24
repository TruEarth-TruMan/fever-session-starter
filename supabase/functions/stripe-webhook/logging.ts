
import { supabase } from './config.ts'
import type { WebhookLogEvent, RequestLogDetails } from './types.ts'
import type Stripe from 'https://esm.sh/stripe@13.6.0'

// Function to log webhook events to the database
export async function logWebhookEvent(event: Stripe.Event, success: boolean, errorMessage?: string) {
  try {
    const customer = event.data.object as { email?: string, customer?: string }
    await supabase.from('stripe_webhook_logs').insert({
      event_type: event.type,
      payload: event.data.object,
      success: success,
      error_message: errorMessage || null,
      customer_id: customer.customer || null,
      customer_email: customer.email || null
    })
  } catch (logError) {
    console.error('Failed to log webhook event:', logError)
  }
}

// Enhanced request logging function
export async function logRequestDetails(request: Request, status: string, details?: any) {
  try {
    const logDetails: RequestLogDetails = {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
      details: details || {},
      timestamp: new Date().toISOString(),
      debug_mode: true
    }
    
    console.log(`Webhook ${status}:`, JSON.stringify(logDetails))
    
    // Log to database for persistence
    await supabase.from('stripe_webhook_logs').insert({
      event_type: `debug.${status}`,
      payload: logDetails,
      success: status === 'success',
      error_message: status.includes('error') ? JSON.stringify(details) : null,
    })
  } catch (error) {
    console.error('Error logging request details:', error)
  }
}
