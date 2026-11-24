// Generado con `mcp__supabase__generate_typescript_types` a partir del
// esquema real en Supabase. Regenerar cuando cambie supabase/schema.sql.

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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          cancelled_at: string | null
          court_id: string
          created_at: string
          ends_at: string
          establishment_id: string
          guest_name: string | null
          guest_phone: string | null
          id: string
          note: string | null
          price: number | null
          reminded_at: string | null
          source: Database["public"]["Enums"]["booking_source"]
          starts_at: string
          status: Database["public"]["Enums"]["booking_status"]
          user_id: string | null
        }
        Insert: {
          cancelled_at?: string | null
          court_id: string
          created_at?: string
          ends_at: string
          establishment_id: string
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          note?: string | null
          price?: number | null
          reminded_at?: string | null
          source?: Database["public"]["Enums"]["booking_source"]
          starts_at: string
          status?: Database["public"]["Enums"]["booking_status"]
          user_id?: string | null
        }
        Update: {
          cancelled_at?: string | null
          court_id?: string
          created_at?: string
          ends_at?: string
          establishment_id?: string
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          note?: string | null
          price?: number | null
          reminded_at?: string | null
          source?: Database["public"]["Enums"]["booking_source"]
          starts_at?: string
          status?: Database["public"]["Enums"]["booking_status"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_court_id_fkey"
            columns: ["court_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
      court_hours: {
        Row: {
          close_time: string
          court_id: string
          id: string
          open_time: string
          weekday: number
        }
        Insert: {
          close_time: string
          court_id: string
          id?: string
          open_time: string
          weekday: number
        }
        Update: {
          close_time?: string
          court_id?: string
          id?: string
          open_time?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "court_hours_court_id_fkey"
            columns: ["court_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id"]
          },
        ]
      }
      court_prices: {
        Row: {
          court_id: string
          from_time: string
          id: string
          price: number
          to_time: string
          weekday: number | null
        }
        Insert: {
          court_id: string
          from_time: string
          id?: string
          price: number
          to_time: string
          weekday?: number | null
        }
        Update: {
          court_id?: string
          from_time?: string
          id?: string
          price?: number
          to_time?: string
          weekday?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "court_prices_court_id_fkey"
            columns: ["court_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id"]
          },
        ]
      }
      courts: {
        Row: {
          active: boolean
          created_at: string
          default_price: number
          establishment_id: string
          id: string
          name: string
          slot_minutes: number
          sort_order: number
          sport: Database["public"]["Enums"]["sport_type"]
          variant: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          default_price?: number
          establishment_id: string
          id?: string
          name: string
          slot_minutes?: number
          sort_order?: number
          sport: Database["public"]["Enums"]["sport_type"]
          variant?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          default_price?: number
          establishment_id?: string
          id?: string
          name?: string
          slot_minutes?: number
          sort_order?: number
          sport?: Database["public"]["Enums"]["sport_type"]
          variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courts_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
      device_tokens: {
        Row: {
          id: string
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          platform: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      establishment_members: {
        Row: {
          establishment_id: string
          role: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        Insert: {
          establishment_id: string
          role?: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        Update: {
          establishment_id?: string
          role?: Database["public"]["Enums"]["member_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "establishment_members_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
      establishment_player_blocks: {
        Row: {
          created_at: string
          establishment_id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          establishment_id: string
          reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          establishment_id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "establishment_player_blocks_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
      establishments: {
        Row: {
          active: boolean
          address: string | null
          cancel_hours_before: number
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          photos: string[]
          slug: string
          timezone: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          cancel_hours_before?: number
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          photos?: string[]
          slug: string
          timezone?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          cancel_hours_before?: number
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          photos?: string[]
          slug?: string
          timezone?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          data: Json
          id: string
          pushed_at: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          data?: Json
          id?: string
          pushed_at?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json
          id?: string
          pushed_at?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          dni: string | null
          email: string | null
          full_name: string | null
          id: string
          is_super_admin: boolean
          phone: string | null
        }
        Insert: {
          created_at?: string
          dni?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_super_admin?: boolean
          phone?: string | null
        }
        Update: {
          created_at?: string
          dni?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_super_admin?: boolean
          phone?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      player_no_shows: {
        Row: {
          establishment_id: string | null
          last_no_show: string | null
          no_shows: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      cancel_booking: {
        Args: { p_booking: string }
        Returns: {
          cancelled_at: string | null
          court_id: string
          created_at: string
          ends_at: string
          establishment_id: string
          guest_name: string | null
          guest_phone: string | null
          id: string
          note: string | null
          price: number | null
          reminded_at: string | null
          source: Database["public"]["Enums"]["booking_source"]
          starts_at: string
          status: Database["public"]["Enums"]["booking_status"]
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "bookings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_booking: {
        Args: { p_court: string; p_starts_at: string }
        Returns: {
          cancelled_at: string | null
          court_id: string
          created_at: string
          ends_at: string
          establishment_id: string
          guest_name: string | null
          guest_phone: string | null
          id: string
          note: string | null
          price: number | null
          reminded_at: string | null
          source: Database["public"]["Enums"]["booking_source"]
          starts_at: string
          status: Database["public"]["Enums"]["booking_status"]
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "bookings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      enqueue_reminders: { Args: never; Returns: number }
      get_availability: {
        Args: { p_court: string; p_day: string }
        Returns: {
          ends_at: string
          is_free: boolean
          price: number
          starts_at: string
        }[]
      }
      is_member: {
        Args: { p_est: string; p_owner_only?: boolean }
        Returns: boolean
      }
      is_super_admin: { Args: never; Returns: boolean }
      mark_no_show: {
        Args: { p_booking: string }
        Returns: {
          cancelled_at: string | null
          court_id: string
          created_at: string
          ends_at: string
          establishment_id: string
          guest_name: string | null
          guest_phone: string | null
          id: string
          note: string | null
          price: number | null
          reminded_at: string | null
          source: Database["public"]["Enums"]["booking_source"]
          starts_at: string
          status: Database["public"]["Enums"]["booking_status"]
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "bookings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      price_for: { Args: { p_court: string; p_local: string }; Returns: number }
    }
    Enums: {
      booking_source: "app" | "manual"
      booking_status:
        | "confirmed"
        | "blocked"
        | "cancelled"
        | "no_show"
        | "completed"
      member_role: "owner" | "staff"
      sport_type: "padel" | "futbol"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      booking_source: ["app", "manual"],
      booking_status: [
        "confirmed",
        "blocked",
        "cancelled",
        "no_show",
        "completed",
      ],
      member_role: ["owner", "staff"],
      sport_type: ["padel", "futbol"],
    },
  },
} as const
