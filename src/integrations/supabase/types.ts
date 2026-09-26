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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          address: string | null
          created_at: string
          document: string | null
          id: string
          legacy_id: string | null
          name: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          document?: string | null
          id?: string
          legacy_id?: string | null
          name: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          document?: string | null
          id?: string
          legacy_id?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      equipment: {
        Row: {
          acs_device_id: string | null
          created_at: string
          customer_id: string | null
          equipment_type: string
          id: string
          last_seen: string | null
          legacy_id: string | null
          mac: string | null
          manufacturer: string
          model: string
          profile_id: string | null
          serial_number: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          acs_device_id?: string | null
          created_at?: string
          customer_id?: string | null
          equipment_type?: string
          id?: string
          last_seen?: string | null
          legacy_id?: string | null
          mac?: string | null
          manufacturer: string
          model: string
          profile_id?: string | null
          serial_number: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          acs_device_id?: string | null
          created_at?: string
          customer_id?: string | null
          equipment_type?: string
          id?: string
          last_seen?: string | null
          legacy_id?: string | null
          mac?: string | null
          manufacturer?: string
          model?: string
          profile_id?: string | null
          serial_number?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "equipment_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_profiles: {
        Row: {
          config: Json
          created_at: string
          description: string | null
          id: string
          legacy_id: string | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          legacy_id?: string | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          legacy_id?: string | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      evidences: {
        Row: {
          created_at: string
          file_path: string
          id: string
          kind: string
          legacy_id: string | null
          updated_at: string
          user_id: string
          work_order_id: string | null
        }
        Insert: {
          created_at?: string
          file_path: string
          id?: string
          kind: string
          legacy_id?: string | null
          updated_at?: string
          user_id: string
          work_order_id?: string | null
        }
        Update: {
          created_at?: string
          file_path?: string
          id?: string
          kind?: string
          legacy_id?: string | null
          updated_at?: string
          user_id?: string
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidences_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_settings: {
        Row: {
          acs_url: string | null
          acs_username: string | null
          company_name: string | null
          connection_request_path: string | null
          created_at: string
          default_wifi_ssid: string | null
          default_wifi_ssid_5g: string | null
          favicon_url: string | null
          id: string
          logo_url: string | null
          portal_message: string | null
          portal_title: string | null
          reset_policy: string | null
          support_phone: string | null
          support_whatsapp: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          acs_url?: string | null
          acs_username?: string | null
          company_name?: string | null
          connection_request_path?: string | null
          created_at?: string
          default_wifi_ssid?: string | null
          default_wifi_ssid_5g?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          portal_message?: string | null
          portal_title?: string | null
          reset_policy?: string | null
          support_phone?: string | null
          support_whatsapp?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          acs_url?: string | null
          acs_username?: string | null
          company_name?: string | null
          connection_request_path?: string | null
          created_at?: string
          default_wifi_ssid?: string | null
          default_wifi_ssid_5g?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          portal_message?: string | null
          portal_title?: string | null
          reset_policy?: string | null
          support_phone?: string | null
          support_whatsapp?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      work_orders: {
        Row: {
          created_at: string
          customer_id: string | null
          equipment_id: string | null
          id: string
          legacy_id: string | null
          notes: string | null
          order_type: string
          scheduled_at: string | null
          status: string
          technician_name: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          equipment_id?: string | null
          id?: string
          legacy_id?: string | null
          notes?: string | null
          order_type?: string
          scheduled_at?: string | null
          status?: string
          technician_name?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          equipment_id?: string | null
          id?: string
          legacy_id?: string | null
          notes?: string | null
          order_type?: string
          scheduled_at?: string | null
          status?: string
          technician_name?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
