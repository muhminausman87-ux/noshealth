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
      gcs_scores: {
        Row: {
          created_at: string
          eye_score: number | null
          id: string
          motor_score: number | null
          patient_id: string
          recorded_at: string
          recorded_by: string | null
          total_score: number | null
          updated_at: string
          verbal_score: number | null
        }
        Insert: {
          created_at?: string
          eye_score?: number | null
          id?: string
          motor_score?: number | null
          patient_id: string
          recorded_at?: string
          recorded_by?: string | null
          total_score?: number | null
          updated_at?: string
          verbal_score?: number | null
        }
        Update: {
          created_at?: string
          eye_score?: number | null
          id?: string
          motor_score?: number | null
          patient_id?: string
          recorded_at?: string
          recorded_by?: string | null
          total_score?: number | null
          updated_at?: string
          verbal_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gcs_scores_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          created_at: string
          dose: string
          frequency: string
          id: string
          medication_name: string
          next_due: string | null
          patient_id: string
          prescribed_at: string
          prescribed_by: string | null
          route: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dose: string
          frequency: string
          id?: string
          medication_name: string
          next_due?: string | null
          patient_id: string
          prescribed_at?: string
          prescribed_by?: string | null
          route: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dose?: string
          frequency?: string
          id?: string
          medication_name?: string
          next_due?: string | null
          patient_id?: string
          prescribed_at?: string
          prescribed_by?: string | null
          route?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      nursing_notes: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          id: string
          note_type: string
          patient_id: string
          recorded_at: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          note_type: string
          patient_id: string
          recorded_at?: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          note_type?: string
          patient_id?: string
          recorded_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nursing_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          admitted_on: string
          age: number
          attending_doctor_id: string | null
          code_status: string
          created_at: string
          created_by: string | null
          dept: Database["public"]["Enums"]["dept_code"]
          discharged_on: string | null
          full_name: string
          history_summary: string | null
          id: string
          mrn: string
          primary_nurse_id: string | null
          reason_for_admission: string
          room: string | null
          sex: string
          short_note: string | null
          status: Database["public"]["Enums"]["patient_status"]
          updated_at: string
        }
        Insert: {
          admitted_on?: string
          age: number
          attending_doctor_id?: string | null
          code_status?: string
          created_at?: string
          created_by?: string | null
          dept: Database["public"]["Enums"]["dept_code"]
          discharged_on?: string | null
          full_name: string
          history_summary?: string | null
          id?: string
          mrn: string
          primary_nurse_id?: string | null
          reason_for_admission: string
          room?: string | null
          sex: string
          short_note?: string | null
          status?: Database["public"]["Enums"]["patient_status"]
          updated_at?: string
        }
        Update: {
          admitted_on?: string
          age?: number
          attending_doctor_id?: string | null
          code_status?: string
          created_at?: string
          created_by?: string | null
          dept?: Database["public"]["Enums"]["dept_code"]
          discharged_on?: string | null
          full_name?: string
          history_summary?: string | null
          id?: string
          mrn?: string
          primary_nurse_id?: string | null
          reason_for_admission?: string
          room?: string | null
          sex?: string
          short_note?: string | null
          status?: Database["public"]["Enums"]["patient_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_attending_doctor_id_fkey"
            columns: ["attending_doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_primary_nurse_id_fkey"
            columns: ["primary_nurse_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          assigned_dept: Database["public"]["Enums"]["dept_code"] | null
          created_at: string
          full_name: string
          id: string
          title: string
          updated_at: string
          username: string | null
        }
        Insert: {
          assigned_dept?: Database["public"]["Enums"]["dept_code"] | null
          created_at?: string
          full_name?: string
          id: string
          title?: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          assigned_dept?: Database["public"]["Enums"]["dept_code"] | null
          created_at?: string
          full_name?: string
          id?: string
          title?: string
          updated_at?: string
          username?: string | null
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
          created_at: string
          diastolic_bp: number | null
          heart_rate: number | null
          id: string
          patient_id: string
          recorded_at: string
          recorded_by: string | null
          respiratory_rate: number | null
          spo2: number | null
          systolic_bp: number | null
          temperature: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          diastolic_bp?: number | null
          heart_rate?: number | null
          id?: string
          patient_id: string
          recorded_at?: string
          recorded_by?: string | null
          respiratory_rate?: number | null
          spo2?: number | null
          systolic_bp?: number | null
          temperature?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          diastolic_bp?: number | null
          heart_rate?: number | null
          id?: string
          patient_id?: string
          recorded_at?: string
          recorded_by?: string | null
          respiratory_rate?: number | null
          spo2?: number | null
          systolic_bp?: number | null
          temperature?: number | null
          updated_at?: string
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
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "doctor" | "nurse" | "lab" | "radiology"
      dept_code:
        | "ed"
        | "icu"
        | "medsurg"
        | "maternity"
        | "cardiac"
        | "labour"
        | "pediatric"
        | "medical"
        | "surgical"
        | "opd"
        | "daycare"
        | "ot"
      patient_status: "stable" | "watch" | "critical"
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
      app_role: ["admin", "doctor", "nurse", "lab", "radiology"],
      dept_code: [
        "ed",
        "icu",
        "medsurg",
        "maternity",
        "cardiac",
        "labour",
        "pediatric",
        "medical",
        "surgical",
        "opd",
        "daycare",
        "ot",
      ],
      patient_status: ["stable", "watch", "critical"],
    },
  },
} as const
