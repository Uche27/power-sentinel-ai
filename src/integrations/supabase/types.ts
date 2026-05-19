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
      dataset_rows: {
        Row: {
          data: Json
          dataset_id: string
          id: string
          row_index: number
        }
        Insert: {
          data: Json
          dataset_id: string
          id?: string
          row_index: number
        }
        Update: {
          data?: Json
          dataset_id?: string
          id?: string
          row_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "dataset_rows_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      datasets: {
        Row: {
          columns: Json
          columns_count: number
          created_at: string
          file_path: string | null
          id: string
          name: string
          rows_count: number
          size_bytes: number
          uploaded_by: string
        }
        Insert: {
          columns?: Json
          columns_count?: number
          created_at?: string
          file_path?: string | null
          id?: string
          name: string
          rows_count?: number
          size_bytes?: number
          uploaded_by: string
        }
        Update: {
          columns?: Json
          columns_count?: number
          created_at?: string
          file_path?: string | null
          id?: string
          name?: string
          rows_count?: number
          size_bytes?: number
          uploaded_by?: string
        }
        Relationships: []
      }
      field_inspections: {
        Row: {
          action_taken: string
          created_at: string
          customer_name: string
          findings: string
          id: string
          inspector_id: string
          location: string
          meter_no: string
          outcome: string
          report_id: string | null
        }
        Insert: {
          action_taken: string
          created_at?: string
          customer_name: string
          findings: string
          id?: string
          inspector_id: string
          location: string
          meter_no: string
          outcome?: string
          report_id?: string | null
        }
        Update: {
          action_taken?: string
          created_at?: string
          customer_name?: string
          findings?: string
          id?: string
          inspector_id?: string
          location?: string
          meter_no?: string
          outcome?: string
          report_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "field_inspections_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "suspicious_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_reports: {
        Row: {
          created_at: string
          format: string
          generated_by: string
          id: string
          report_type: string
          size_bytes: number
          title: string
        }
        Insert: {
          created_at?: string
          format: string
          generated_by: string
          id?: string
          report_type: string
          size_bytes?: number
          title: string
        }
        Update: {
          created_at?: string
          format?: string
          generated_by?: string
          id?: string
          report_type?: string
          size_bytes?: number
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      suspicious_reports: {
        Row: {
          created_at: string
          customer_name: string
          description: string
          disco: string | null
          id: string
          location: string
          meter_no: string
          reported_by: string
          severity: string
          status: string
        }
        Insert: {
          created_at?: string
          customer_name: string
          description: string
          disco?: string | null
          id?: string
          location: string
          meter_no: string
          reported_by: string
          severity?: string
          status?: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          description?: string
          disco?: string | null
          id?: string
          location?: string
          meter_no?: string
          reported_by?: string
          severity?: string
          status?: string
        }
        Relationships: []
      }
      trained_models: {
        Row: {
          accuracy: number
          algorithm: string
          created_at: string
          created_by: string
          curve: Json
          dataset_id: string | null
          f1: number
          id: string
          name: string
          params: Json
          precision: number
          recall: number
          training_time: string | null
        }
        Insert: {
          accuracy: number
          algorithm: string
          created_at?: string
          created_by: string
          curve?: Json
          dataset_id?: string | null
          f1: number
          id?: string
          name: string
          params?: Json
          precision: number
          recall: number
          training_time?: string | null
        }
        Update: {
          accuracy?: number
          algorithm?: string
          created_at?: string
          created_by?: string
          curve?: Json
          dataset_id?: string | null
          f1?: number
          id?: string
          name?: string
          params?: Json
          precision?: number
          recall?: number
          training_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trained_models_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "utility_staff"
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
    Enums: {
      app_role: ["admin", "utility_staff"],
    },
  },
} as const
