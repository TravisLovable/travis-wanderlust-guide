export interface CountryData {
  code: string;
  name: string;
  flag: string;
  region?: string;
  currency?: string;
  timezone?: string;
  subregion?: string;
  currencySymbol?: string;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      country_visa_official_sources: {
        Row: {
          created_at: string
          destination_country_code: string
          http_status: number | null
          id: number
          is_active: boolean
          is_primary: boolean
          language: string | null
          last_checked_at: string | null
          last_verified: string | null
          notes: string | null
          official_url: string
          source_authority: string
          updated_at: string
          url_label: string
        }
        Insert: {
          created_at?: string
          destination_country_code: string
          http_status?: number | null
          id?: never
          is_active?: boolean
          is_primary?: boolean
          language?: string | null
          last_checked_at?: string | null
          last_verified?: string | null
          notes?: string | null
          official_url: string
          source_authority: string
          updated_at?: string
          url_label: string
        }
        Update: {
          created_at?: string
          destination_country_code?: string
          http_status?: number | null
          id?: never
          is_active?: boolean
          is_primary?: boolean
          language?: string | null
          last_checked_at?: string | null
          last_verified?: string | null
          notes?: string | null
          official_url?: string
          source_authority?: string
          updated_at?: string
          url_label?: string
        }
        Relationships: []
      }
      pinned_locations: {
        Row: {
          country_code: string | null
          created_at: string
          formatted_address: string
          id: string
          latitude: number
          longitude: number
          name: string
          pinned_at: string
          place_id: string | null
          region: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          country_code?: string | null
          created_at?: string
          formatted_address: string
          id?: string
          latitude: number
          longitude: number
          name: string
          pinned_at?: string
          place_id?: string | null
          region?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          country_code?: string | null
          created_at?: string
          formatted_address?: string
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          pinned_at?: string
          place_id?: string | null
          region?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pinned_locations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          airlines: string[] | null
          // Manual override: alert_preferences is an object map of alert key -> bool.
          alert_preferences: { [key: string]: boolean } | null
          // Manual override: auth_id is enforced non-null at the app layer
          // (every public.users row is reconciled with an auth.users row).
          auth_id: string
          // Manual override: country_data is a CountryData blob, not arbitrary Json.
          country_data: CountryData | null
          created_at: string
          email: string | null
          frequent_flyer_number: string | null
          frequent_flyer_status: string | null
          frequent_flyer_status_by_airline: Json
          full_name: string | null
          home_city: string | null
          id: string
          onboarding_completed: boolean
          passport_country: string | null
          phone: string | null
          phone_country_code: string | null
          preferred_airline: string | null
          profile_photo_url: string | null
          travel_frequency: string | null
          travel_pace: string | null
          travel_styles: string[] | null
          travel_type: string | null
          updated_at: string
        }
        Insert: {
          airlines?: string[] | null
          alert_preferences?: { [key: string]: boolean } | null
          auth_id: string
          country_data?: CountryData | null
          created_at?: string
          email?: string | null
          frequent_flyer_number?: string | null
          frequent_flyer_status?: string | null
          frequent_flyer_status_by_airline?: Json
          full_name?: string | null
          home_city?: string | null
          id?: string
          onboarding_completed?: boolean
          passport_country?: string | null
          phone?: string | null
          phone_country_code?: string | null
          preferred_airline?: string | null
          profile_photo_url?: string | null
          travel_frequency?: string | null
          travel_pace?: string | null
          travel_styles?: string[] | null
          travel_type?: string | null
          updated_at?: string
        }
        Update: {
          airlines?: string[] | null
          alert_preferences?: { [key: string]: boolean } | null
          auth_id?: string
          country_data?: CountryData | null
          created_at?: string
          email?: string | null
          frequent_flyer_number?: string | null
          frequent_flyer_status?: string | null
          frequent_flyer_status_by_airline?: Json
          full_name?: string | null
          home_city?: string | null
          id?: string
          onboarding_completed?: boolean
          passport_country?: string | null
          phone?: string | null
          phone_country_code?: string | null
          preferred_airline?: string | null
          profile_photo_url?: string | null
          travel_frequency?: string | null
          travel_pace?: string | null
          travel_styles?: string[] | null
          travel_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      visa_job_runs: {
        Row: {
          details: Json | null
          failed: number | null
          id: number
          job: string
          ran_at: string
          succeeded: number | null
          total: number | null
        }
        Insert: {
          details?: Json | null
          failed?: number | null
          id?: never
          job: string
          ran_at?: string
          succeeded?: number | null
          total?: number | null
        }
        Update: {
          details?: Json | null
          failed?: number | null
          id?: never
          job?: string
          ran_at?: string
          succeeded?: number | null
          total?: number | null
        }
        Relationships: []
      }
      visa_requirements: {
        Row: {
          destination_country_code: string
          evisa_link: string | null
          max_stay_days: number | null
          origin_country_code: string
          passport_validity: string | null
          registration_note: string | null
          rule: string | null
          source: string
          status: string
          status_label: string | null
          synced_at: string
        }
        Insert: {
          destination_country_code: string
          evisa_link?: string | null
          max_stay_days?: number | null
          origin_country_code: string
          passport_validity?: string | null
          registration_note?: string | null
          rule?: string | null
          source?: string
          status: string
          status_label?: string | null
          synced_at?: string
        }
        Update: {
          destination_country_code?: string
          evisa_link?: string | null
          max_stay_days?: number | null
          origin_country_code?: string
          passport_validity?: string | null
          registration_note?: string | null
          rule?: string | null
          source?: string
          status?: string
          status_label?: string | null
          synced_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      list_owned_storage_objects: {
        Args: { p_uid: string }
        Returns: {
          bucket_id: string
          name: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
