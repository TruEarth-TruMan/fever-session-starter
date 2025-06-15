export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      announcement_acknowledgments: {
        Row: {
          acknowledged_at: string
          announcement_id: string
          id: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string
          announcement_id: string
          id?: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string
          announcement_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_acknowledgments_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          author_id: string
          content: string
          created_at: string
          expire_at: string | null
          id: string
          importance: Database["public"]["Enums"]["announcement_importance"]
          published_at: string | null
          requires_acknowledgment: boolean
          status: Database["public"]["Enums"]["announcement_status"]
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          expire_at?: string | null
          id?: string
          importance?: Database["public"]["Enums"]["announcement_importance"]
          published_at?: string | null
          requires_acknowledgment?: boolean
          status?: Database["public"]["Enums"]["announcement_status"]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          expire_at?: string | null
          id?: string
          importance?: Database["public"]["Enums"]["announcement_importance"]
          published_at?: string | null
          requires_acknowledgment?: boolean
          status?: Database["public"]["Enums"]["announcement_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      beta_invites: {
        Row: {
          code: string
          created_at: string
          created_by: string
          email: string | null
          id: string
          nda_signed: boolean | null
          redeemed_at: string | null
          redeemed_by: string | null
          status: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
          email?: string | null
          id?: string
          nda_signed?: boolean | null
          redeemed_at?: string | null
          redeemed_by?: string | null
          status?: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          email?: string | null
          id?: string
          nda_signed?: boolean | null
          redeemed_at?: string | null
          redeemed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      beta_requests: {
        Row: {
          approved_at: string | null
          declined_at: string | null
          email: string
          first_name: string
          id: string
          invite_code: string | null
          invited_by: string | null
          last_name: string
          nda_signed: boolean
          reason: string | null
          role: string
          status: string
          submitted_at: string
        }
        Insert: {
          approved_at?: string | null
          declined_at?: string | null
          email: string
          first_name: string
          id?: string
          invite_code?: string | null
          invited_by?: string | null
          last_name: string
          nda_signed?: boolean
          reason?: string | null
          role: string
          status?: string
          submitted_at?: string
        }
        Update: {
          approved_at?: string | null
          declined_at?: string | null
          email?: string
          first_name?: string
          id?: string
          invite_code?: string | null
          invited_by?: string | null
          last_name?: string
          nda_signed?: boolean
          reason?: string | null
          role?: string
          status?: string
          submitted_at?: string
        }
        Relationships: []
      }
      beta_settings: {
        Row: {
          beta_active: boolean
          created_at: string
          id: string
          require_invite_code: boolean
          require_nda: boolean
          site_domain: string
          stripe_enabled: boolean
          updated_at: string
        }
        Insert: {
          beta_active?: boolean
          created_at?: string
          id?: string
          require_invite_code?: boolean
          require_nda?: boolean
          site_domain?: string
          stripe_enabled?: boolean
          updated_at?: string
        }
        Update: {
          beta_active?: boolean
          created_at?: string
          id?: string
          require_invite_code?: boolean
          require_nda?: boolean
          site_domain?: string
          stripe_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      billing_records: {
        Row: {
          amount: number | null
          client_id: string
          created_at: string
          id: string
          paid_at: string | null
          provider_id: string
          service_code: string
          service_date: string
          status: string
          submitted_at: string | null
          units: number
          updated_at: string
        }
        Insert: {
          amount?: number | null
          client_id: string
          created_at?: string
          id?: string
          paid_at?: string | null
          provider_id: string
          service_code: string
          service_date?: string
          status?: string
          submitted_at?: string | null
          units: number
          updated_at?: string
        }
        Update: {
          amount?: number | null
          client_id?: string
          created_at?: string
          id?: string
          paid_at?: string | null
          provider_id?: string
          service_code?: string
          service_date?: string
          status?: string
          submitted_at?: string | null
          units?: number
          updated_at?: string
        }
        Relationships: []
      }
      bonus_rules: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          is_active: boolean
          is_percentage: boolean
          name: string
          org_id: string
          role: string
          threshold: number
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          is_percentage?: boolean
          name: string
          org_id: string
          role: string
          threshold: number
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          is_percentage?: boolean
          name?: string
          org_id?: string
          role?: string
          threshold?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      clara_user_data: {
        Row: {
          created_at: string | null
          id: string
          last_interaction: string | null
          last_nudge_shown: string | null
          mood_logs: Json | null
          preferences: Json | null
          routine_stats: Json | null
          updated_at: string | null
          user_id: string
          user_timezone: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_interaction?: string | null
          last_nudge_shown?: string | null
          mood_logs?: Json | null
          preferences?: Json | null
          routine_stats?: Json | null
          updated_at?: string | null
          user_id: string
          user_timezone?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_interaction?: string | null
          last_nudge_shown?: string | null
          mood_logs?: Json | null
          preferences?: Json | null
          routine_stats?: Json | null
          updated_at?: string | null
          user_id?: string
          user_timezone?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          file_path: string
          file_size: number
          file_type: string
          id: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_path: string
          file_size: number
          file_type: string
          id?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      e_signatures: {
        Row: {
          created_at: string
          document_id: string
          expires_at: string | null
          id: string
          requester_id: string
          signature_data: Json | null
          signed_at: string | null
          signer_email: string
          signer_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_id: string
          expires_at?: string | null
          id?: string
          requester_id: string
          signature_data?: Json | null
          signed_at?: string | null
          signer_email: string
          signer_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_id?: string
          expires_at?: string | null
          id?: string
          requester_id?: string
          signature_data?: Json | null
          signed_at?: string | null
          signer_email?: string
          signer_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "e_signatures_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          id: string
          priority: string
          reporter_id: string
          resolved_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string
          reporter_id: string
          resolved_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string
          reporter_id?: string
          resolved_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      onboarding_checklists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_required: boolean
          name: string
          org_id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_required?: boolean
          name: string
          org_id: string
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_required?: boolean
          name?: string
          org_id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      org_banking: {
        Row: {
          account_name: string
          account_number: string
          account_type: string
          created_at: string
          id: string
          is_verified: boolean
          org_id: string
          routing_number: string
          updated_at: string
          verification_date: string | null
          verification_method: string | null
        }
        Insert: {
          account_name: string
          account_number: string
          account_type: string
          created_at?: string
          id?: string
          is_verified?: boolean
          org_id: string
          routing_number: string
          updated_at?: string
          verification_date?: string | null
          verification_method?: string | null
        }
        Update: {
          account_name?: string
          account_number?: string
          account_type?: string
          created_at?: string
          id?: string
          is_verified?: boolean
          org_id?: string
          routing_number?: string
          updated_at?: string
          verification_date?: string | null
          verification_method?: string | null
        }
        Relationships: []
      }
      pay_periods: {
        Row: {
          created_at: string
          end_date: string
          id: string
          org_id: string
          pay_date: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          org_id: string
          pay_date: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          org_id?: string
          pay_date?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      pay_rate_configs: {
        Row: {
          created_at: string
          effective_date: string
          end_date: string | null
          id: string
          org_id: string
          payment_type: Database["public"]["Enums"]["payment_type"]
          rate: number
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          effective_date?: string
          end_date?: string | null
          id?: string
          org_id: string
          payment_type: Database["public"]["Enums"]["payment_type"]
          rate: number
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          effective_date?: string
          end_date?: string | null
          id?: string
          org_id?: string
          payment_type?: Database["public"]["Enums"]["payment_type"]
          rate?: number
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      payroll_entries: {
        Row: {
          adjustments: number | null
          base_pay: number
          bonus: number | null
          created_at: string
          hours: number | null
          id: string
          notes: string | null
          pay_period_id: string
          role: string
          sessions: number | null
          status: string
          total_pay: number
          updated_at: string
          user_id: string
        }
        Insert: {
          adjustments?: number | null
          base_pay: number
          bonus?: number | null
          created_at?: string
          hours?: number | null
          id?: string
          notes?: string | null
          pay_period_id: string
          role: string
          sessions?: number | null
          status?: string
          total_pay: number
          updated_at?: string
          user_id: string
        }
        Update: {
          adjustments?: number | null
          base_pay?: number
          bonus?: number | null
          created_at?: string
          hours?: number | null
          id?: string
          notes?: string | null
          pay_period_id?: string
          role?: string
          sessions?: number | null
          status?: string
          total_pay?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_entries_pay_period_id_fkey"
            columns: ["pay_period_id"]
            isOneToOne: false
            referencedRelation: "pay_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          bcba_id: string
          client_id: string
          content: string | null
          created_at: string
          id: string
          published_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          bcba_id: string
          client_id: string
          content?: string | null
          created_at?: string
          id?: string
          published_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          bcba_id?: string
          client_id?: string
          content?: string | null
          created_at?: string
          id?: string
          published_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          assigned_client_name: string | null
          client_id: string | null
          created_at: string | null
          email: string
          fever_plus: boolean | null
          id: string
          name: string | null
          onboarding_completed: boolean | null
          role: string | null
          saved_sessions: Json | null
          stripe_customer_id: string | null
          subscription_end: string | null
          subscription_tier: string | null
        }
        Insert: {
          assigned_client_name?: string | null
          client_id?: string | null
          created_at?: string | null
          email: string
          fever_plus?: boolean | null
          id: string
          name?: string | null
          onboarding_completed?: boolean | null
          role?: string | null
          saved_sessions?: Json | null
          stripe_customer_id?: string | null
          subscription_end?: string | null
          subscription_tier?: string | null
        }
        Update: {
          assigned_client_name?: string | null
          client_id?: string | null
          created_at?: string | null
          email?: string
          fever_plus?: boolean | null
          id?: string
          name?: string | null
          onboarding_completed?: boolean | null
          role?: string | null
          saved_sessions?: Json | null
          stripe_customer_id?: string | null
          subscription_end?: string | null
          subscription_tier?: string | null
        }
        Relationships: []
      }
      recognition_submissions: {
        Row: {
          achievement: string
          created_at: string
          date: string
          description: string
          id: string
          nominee_name: string
          status: string
          submitter_id: string
        }
        Insert: {
          achievement: string
          created_at?: string
          date: string
          description: string
          id?: string
          nominee_name: string
          status?: string
          submitter_id: string
        }
        Update: {
          achievement?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          nominee_name?: string
          status?: string
          submitter_id?: string
        }
        Relationships: []
      }
      relationships: {
        Row: {
          bcba_id: string | null
          client_id: string | null
          created_at: string
          id: string
          parent_id: string | null
          rbt_id: string | null
          relationship_type: string
          status: string
          updated_at: string
        }
        Insert: {
          bcba_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          parent_id?: string | null
          rbt_id?: string | null
          relationship_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          bcba_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          parent_id?: string | null
          rbt_id?: string | null
          relationship_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      session_notes: {
        Row: {
          client_id: string
          content: string | null
          created_at: string
          duration: number | null
          id: string
          provider_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          session_date: string
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          content?: string | null
          created_at?: string
          duration?: number | null
          id?: string
          provider_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          session_date?: string
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          content?: string | null
          created_at?: string
          duration?: number | null
          id?: string
          provider_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          session_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          created_at: string
          fx: Json
          id: string
          is_favorite: boolean
          loop_region: Json | null
          name: string
          tracks: Json
          type: Database["public"]["Enums"]["session_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          fx?: Json
          id?: string
          is_favorite?: boolean
          loop_region?: Json | null
          name: string
          tracks?: Json
          type: Database["public"]["Enums"]["session_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          fx?: Json
          id?: string
          is_favorite?: boolean
          loop_region?: Json | null
          name?: string
          tracks?: Json
          type?: Database["public"]["Enums"]["session_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shift_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          shift_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          shift_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          notification_type?: Database["public"]["Enums"]["notification_type"]
          shift_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_notifications_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          assigned_by: string
          color: string
          created_at: string
          description: string | null
          end_time: string
          id: string
          start_time: string
          status: Database["public"]["Enums"]["shift_status"]
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_by: string
          color?: string
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          start_time: string
          status?: Database["public"]["Enums"]["shift_status"]
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_by?: string
          color?: string
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          start_time?: string
          status?: Database["public"]["Enums"]["shift_status"]
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shifts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_webhook_logs: {
        Row: {
          customer_email: string | null
          customer_id: string | null
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          processed_at: string | null
          success: boolean
        }
        Insert: {
          customer_email?: string | null
          customer_id?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          payload: Json
          processed_at?: string | null
          success: boolean
        }
        Update: {
          customer_email?: string | null
          customer_id?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          success?: boolean
        }
        Relationships: []
      }
      subscription_events: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          stripe_customer_id: string | null
          subscription_tier: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          stripe_customer_id?: string | null
          subscription_tier?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          stripe_customer_id?: string | null
          subscription_tier?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_banking: {
        Row: {
          account_name: string
          account_number: string
          account_type: string
          created_at: string
          id: string
          is_verified: boolean
          routing_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_name: string
          account_number: string
          account_type: string
          created_at?: string
          id?: string
          is_verified?: boolean
          routing_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_name?: string
          account_number?: string
          account_type?: string
          created_at?: string
          id?: string
          is_verified?: boolean
          routing_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_onboarding_items: {
        Row: {
          checklist_id: string
          completed_at: string | null
          created_at: string
          document_url: string | null
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["onboarding_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          checklist_id: string
          completed_at?: string | null
          created_at?: string
          document_url?: string | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["onboarding_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          checklist_id?: string
          completed_at?: string | null
          created_at?: string
          document_url?: string | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["onboarding_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_onboarding_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "onboarding_checklists"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_org_banking_by_org_id: {
        Args: { p_org_id: string }
        Returns: {
          account_name: string
          account_number: string
          account_type: string
          created_at: string
          id: string
          is_verified: boolean
          org_id: string
          routing_number: string
          updated_at: string
          verification_date: string | null
          verification_method: string | null
        }[]
      }
      insert_org_banking: {
        Args: {
          p_org_id: string
          p_account_name: string
          p_account_type: string
          p_account_number: string
          p_routing_number: string
          p_is_verified: boolean
          p_verification_method: string
          p_verification_date: string
        }
        Returns: undefined
      }
      update_org_banking: {
        Args: {
          p_id: string
          p_account_name: string
          p_account_type: string
          p_account_number: string
          p_routing_number: string
          p_is_verified: boolean
          p_verification_method: string
          p_verification_date: string
        }
        Returns: undefined
      }
      update_org_banking_verification: {
        Args: {
          p_id: string
          p_verification_method: string
          p_verification_date: string
        }
        Returns: undefined
      }
      update_org_banking_verification_status: {
        Args: {
          p_id: string
          p_is_verified: boolean
          p_verification_date: string
        }
        Returns: undefined
      }
    }
    Enums: {
      announcement_importance: "low" | "normal" | "high" | "urgent"
      announcement_status: "draft" | "published" | "archived"
      notification_type: "assignment" | "update" | "reminder"
      onboarding_status: "not_started" | "in_progress" | "complete"
      payment_type: "hourly" | "salary" | "flat_rate"
      session_type: "voice" | "guitar" | "podcast" | "keyboard" | "band"
      shift_status: "scheduled" | "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      announcement_importance: ["low", "normal", "high", "urgent"],
      announcement_status: ["draft", "published", "archived"],
      notification_type: ["assignment", "update", "reminder"],
      onboarding_status: ["not_started", "in_progress", "complete"],
      payment_type: ["hourly", "salary", "flat_rate"],
      session_type: ["voice", "guitar", "podcast", "keyboard", "band"],
      shift_status: ["scheduled", "completed", "cancelled"],
    },
  },
} as const
