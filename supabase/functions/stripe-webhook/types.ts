
import Stripe from 'https://esm.sh/stripe@13.6.0'

export interface WebhookLogEvent {
  event_type: string
  payload: any
  success: boolean
  error_message?: string | null
  customer_id?: string | null
  customer_email?: string | null
}

export interface RequestLogDetails {
  method: string
  url: string
  headers: Record<string, string>
  details?: any
  timestamp: string
  debug_mode: boolean
}

export interface SubscriptionUpdate {
  customerId: string
  subscriptionTier: string
  subscriptionEnd: string | null
}
