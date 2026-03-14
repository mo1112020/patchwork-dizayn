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
      designer_settings: {
        Row: {
          canvas_grid_size: number
          company_email: string
          company_name: string
          created_at: string
          default_rug_height: number
          default_rug_width: number
          default_tool_mode: string
          grid_unit_size: number
          hero_images: Json
          id: string
          max_rug_height: number
          max_rug_width: number
          pdf_header_text: string
          precision_tolerance: number
          price_per_sqm: number
          show_grid: boolean
          show_price: boolean
          show_rulers: boolean
          thread_colors: Json
          updated_at: string
          waste_allowance: number
        }
        Insert: {
          canvas_grid_size?: number
          company_email?: string
          company_name?: string
          created_at?: string
          default_rug_height?: number
          default_rug_width?: number
          default_tool_mode?: string
          grid_unit_size?: number
          hero_images?: Json
          id?: string
          max_rug_height?: number
          max_rug_width?: number
          pdf_header_text?: string
          precision_tolerance?: number
          price_per_sqm?: number
          show_grid?: boolean
          show_price?: boolean
          show_rulers?: boolean
          thread_colors?: Json
          updated_at?: string
          waste_allowance?: number
        }
        Update: {
          canvas_grid_size?: number
          company_email?: string
          company_name?: string
          created_at?: string
          default_rug_height?: number
          default_rug_width?: number
          default_tool_mode?: string
          grid_unit_size?: number
          hero_images?: Json
          id?: string
          max_rug_height?: number
          max_rug_width?: number
          pdf_header_text?: string
          precision_tolerance?: number
          price_per_sqm?: number
          show_grid?: boolean
          show_price?: boolean
          show_rulers?: boolean
          thread_colors?: Json
          updated_at?: string
          waste_allowance?: number
        }
        Relationships: []
      }
      designs: {
        Row: {
          created_at: string
          height: number
          id: string
          name: string
          patches: Json
          total_area: number
          total_price: number
          updated_at: string
          user_id: string
          width: number
        }
        Insert: {
          created_at?: string
          height: number
          id?: string
          name?: string
          patches?: Json
          total_area: number
          total_price: number
          updated_at?: string
          user_id: string
          width: number
        }
        Update: {
          created_at?: string
          height?: number
          id?: string
          name?: string
          patches?: Json
          total_area?: number
          total_price?: number
          updated_at?: string
          user_id?: string
          width?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          admin_note: string | null
          created_at: string
          design_id: string | null
          design_snapshot: Json
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          design_id?: string | null
          design_snapshot?: Json
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          design_id?: string | null
          design_snapshot?: Json
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "designs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rug_textures: {
        Row: {
          category: string
          code: string
          created_at: string
          display_order: number
          hex: string | null
          id: string
          image_path: string | null
          name: string
          updated_at: string
        }
        Insert: {
          category?: string
          code: string
          created_at?: string
          display_order?: number
          hex?: string | null
          id: string
          image_path?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          display_order?: number
          hex?: string | null
          id?: string
          image_path?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
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
