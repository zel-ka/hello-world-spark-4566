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
      alerts: {
        Row: {
          created_at: string
          id: string
          message: string
          patient_id: string
          patient_name: string
          resolved: boolean
          time: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          patient_id: string
          patient_name: string
          resolved?: boolean
          time?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          patient_id?: string
          patient_name?: string
          resolved?: boolean
          time?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      allergies: {
        Row: {
          allergen: string
          created_at: string
          id: string
          patient_id: string
          reaction: string | null
          severity: string
        }
        Insert: {
          allergen: string
          created_at?: string
          id?: string
          patient_id: string
          reaction?: string | null
          severity?: string
        }
        Update: {
          allergen?: string
          created_at?: string
          id?: string
          patient_id?: string
          reaction?: string | null
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "allergies_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          created_at: string
          doctor_name: string
          id: string
          notes: string | null
          patient_id: string
          reason: string | null
          status: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_time?: string
          created_at?: string
          doctor_name?: string
          id?: string
          notes?: string | null
          patient_id: string
          reason?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          created_at?: string
          doctor_name?: string
          id?: string
          notes?: string | null
          patient_id?: string
          reason?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          answers: Json
          created_at: string
          id: string
          raw_score: number | null
          recommendations: Json
          risk_level: string
          score: number
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          id?: string
          raw_score?: number | null
          recommendations?: Json
          risk_level?: string
          score?: number
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          raw_score?: number | null
          recommendations?: Json
          risk_level?: string
          score?: number
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_logs: {
        Row: {
          created_at: string
          exercise_minutes: number | null
          id: string
          log_date: string
          meals_logged: number | null
          mood: string | null
          notes: string | null
          sleep_hours: number | null
          stress_level: number | null
          updated_at: string
          user_id: string
          water_glasses: number | null
        }
        Insert: {
          created_at?: string
          exercise_minutes?: number | null
          id?: string
          log_date?: string
          meals_logged?: number | null
          mood?: string | null
          notes?: string | null
          sleep_hours?: number | null
          stress_level?: number | null
          updated_at?: string
          user_id: string
          water_glasses?: number | null
        }
        Update: {
          created_at?: string
          exercise_minutes?: number | null
          id?: string
          log_date?: string
          meals_logged?: number | null
          mood?: string | null
          notes?: string | null
          sleep_hours?: number | null
          stress_level?: number | null
          updated_at?: string
          user_id?: string
          water_glasses?: number | null
        }
        Relationships: []
      }
      health_entries: {
        Row: {
          blood_sugar: number | null
          cholesterol: number | null
          created_at: string
          diastolic: number
          heart_rate: number
          id: string
          patient_id: string
          recorded_date: string
          systolic: number
          temperature: number
          user_id: string
          weight: number
        }
        Insert: {
          blood_sugar?: number | null
          cholesterol?: number | null
          created_at?: string
          diastolic: number
          heart_rate: number
          id?: string
          patient_id: string
          recorded_date?: string
          systolic: number
          temperature?: number
          user_id: string
          weight: number
        }
        Update: {
          blood_sugar?: number | null
          cholesterol?: number | null
          created_at?: string
          diastolic?: number
          heart_rate?: number
          id?: string
          patient_id?: string
          recorded_date?: string
          systolic?: number
          temperature?: number
          user_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "health_entries_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      health_scores: {
        Row: {
          breakdown: Json
          computed_for_date: string
          created_at: string
          id: string
          score: number
          user_id: string
        }
        Insert: {
          breakdown?: Json
          computed_for_date?: string
          created_at?: string
          id?: string
          score?: number
          user_id: string
        }
        Update: {
          breakdown?: Json
          computed_for_date?: string
          created_at?: string
          id?: string
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      medical_history: {
        Row: {
          condition: string
          created_at: string
          diagnosis_date: string | null
          id: string
          notes: string | null
          patient_id: string
          status: string
          updated_at: string
        }
        Insert: {
          condition: string
          created_at?: string
          diagnosis_date?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          condition?: string
          created_at?: string
          diagnosis_date?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_history_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          quantity?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          created_at: string
          customer_name: string
          id: string
          notes: string | null
          phone: string
          shipping: number
          status: string
          subtotal: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string
          created_at?: string
          customer_name?: string
          id?: string
          notes?: string | null
          phone?: string
          shipping?: number
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string
          customer_name?: string
          id?: string
          notes?: string | null
          phone?: string
          shipping?: number
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          age: number
          bp: string | null
          condition: string
          created_at: string
          gender: string
          id: string
          last_visit: string | null
          medicines: string[] | null
          name: string
          notes: string | null
          patient_code: string
          phone: string | null
          risk_level: string
          sugar: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          age: number
          bp?: string | null
          condition?: string
          created_at?: string
          gender: string
          id?: string
          last_visit?: string | null
          medicines?: string[] | null
          name: string
          notes?: string | null
          patient_code: string
          phone?: string | null
          risk_level?: string
          sugar?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          age?: number
          bp?: string | null
          condition?: string
          created_at?: string
          gender?: string
          id?: string
          last_visit?: string | null
          medicines?: string[] | null
          name?: string
          notes?: string | null
          patient_code?: string
          phone?: string | null
          risk_level?: string
          sugar?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          badge: string | null
          category: string
          created_at: string
          desc_en: string
          desc_sw: string
          emoji: string
          id: string
          name_en: string
          name_sw: string
          price: number
          rating: number
          stock: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          badge?: string | null
          category: string
          created_at?: string
          desc_en?: string
          desc_sw?: string
          emoji?: string
          id?: string
          name_en: string
          name_sw: string
          price?: number
          rating?: number
          stock?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          badge?: string | null
          category?: string
          created_at?: string
          desc_en?: string
          desc_sw?: string
          emoji?: string
          id?: string
          name_en?: string
          name_sw?: string
          price?: number
          rating?: number
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_level: string | null
          address: string | null
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          full_name: string
          gender: string | null
          height_cm: number | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_level?: string | null
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string
          gender?: string | null
          height_cm?: number | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_level?: string | null
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string
          gender?: string | null
          height_cm?: number | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recommendations_shown: {
        Row: {
          category: string
          created_at: string
          id: string
          shown_date: string
          tip_id: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          shown_date?: string
          tip_id: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          shown_date?: string
          tip_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vitals: {
        Row: {
          adherence: number
          created_at: string
          diastolic: number
          id: string
          patient_id: string
          recorded_date: string
          sugar: number
          systolic: number
        }
        Insert: {
          adherence?: number
          created_at?: string
          diastolic: number
          id?: string
          patient_id: string
          recorded_date: string
          sugar?: number
          systolic: number
        }
        Update: {
          adherence?: number
          created_at?: string
          diastolic?: number
          id?: string
          patient_id?: string
          recorded_date?: string
          sugar?: number
          systolic?: number
        }
        Relationships: [
          {
            foreignKeyName: "vitals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "patient" | "doctor" | "admin"
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
      app_role: ["patient", "doctor", "admin"],
    },
  },
} as const
