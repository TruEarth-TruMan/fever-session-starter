
export interface SessionDetails {
  id: string;
  customer_email: string | null;
  subscription_status: string | null;
  subscription_tier: string | null;
  success: boolean;
}
