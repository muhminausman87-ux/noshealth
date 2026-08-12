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
      acuity_events: {
        Row: {
          created_at: string
          created_by: string | null
          event_type: string
          from_score: number | null
          id: string
          institution_id: string
          note: string | null
          occurred_at: string
          patient_id: string
          to_score: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          event_type?: string
          from_score?: number | null
          id?: string
          institution_id: string
          note?: string | null
          occurred_at?: string
          patient_id: string
          to_score?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          event_type?: string
          from_score?: number | null
          id?: string
          institution_id?: string
          note?: string | null
          occurred_at?: string
          patient_id?: string
          to_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "acuity_events_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acuity_events_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          institution_id: string | null
          metadata: Json
          occurred_at: string
          result: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          institution_id?: string | null
          metadata?: Json
          occurred_at?: string
          result?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          institution_id?: string | null
          metadata?: Json
          occurred_at?: string
          result?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_responsibilities: {
        Row: {
          created_at: string
          department: Database["public"]["Enums"]["dept_code"] | null
          id: string
          institution_id: string
          responsibility: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: Database["public"]["Enums"]["dept_code"] | null
          id?: string
          institution_id: string
          responsibility: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: Database["public"]["Enums"]["dept_code"] | null
          id?: string
          institution_id?: string
          responsibility?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_responsibilities_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
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
      institution_policies: {
        Row: {
          active: boolean
          code: string
          created_at: string
          department: Database["public"]["Enums"]["dept_code"] | null
          escalation_pathway: Json
          id: string
          institution_id: string
          kind: string
          summary: string | null
          title: string
          trigger_expression: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          department?: Database["public"]["Enums"]["dept_code"] | null
          escalation_pathway?: Json
          id?: string
          institution_id: string
          kind?: string
          summary?: string | null
          title: string
          trigger_expression?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          department?: Database["public"]["Enums"]["dept_code"] | null
          escalation_pathway?: Json
          id?: string
          institution_id?: string
          kind?: string
          summary?: string | null
          title?: string
          trigger_expression?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "institution_policies_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          status: string
          timezone: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          status?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          status?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
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
      nursing_capacity: {
        Row: {
          available_minutes: number
          break_minutes: number
          competency_level: string
          created_at: string
          department: Database["public"]["Enums"]["dept_code"]
          employee_id: string
          id: string
          institution_id: string
          notes: string | null
          on_leave: boolean
          responsibility_level: string
          shift: string
          shift_date: string
          updated_at: string
        }
        Insert: {
          available_minutes?: number
          break_minutes?: number
          competency_level?: string
          created_at?: string
          department: Database["public"]["Enums"]["dept_code"]
          employee_id: string
          id?: string
          institution_id: string
          notes?: string | null
          on_leave?: boolean
          responsibility_level?: string
          shift?: string
          shift_date?: string
          updated_at?: string
        }
        Update: {
          available_minutes?: number
          break_minutes?: number
          competency_level?: string
          created_at?: string
          department?: Database["public"]["Enums"]["dept_code"]
          employee_id?: string
          id?: string
          institution_id?: string
          notes?: string | null
          on_leave?: boolean
          responsibility_level?: string
          shift?: string
          shift_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nursing_capacity_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
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
      patient_acuity: {
        Row: {
          acuity_level: string
          complexity_indicators: Json
          computation_source: string
          created_at: string
          department: Database["public"]["Enums"]["dept_code"] | null
          id: string
          institution_id: string
          mews_current: number | null
          mews_previous: number | null
          mews_previous_at: string | null
          mews_recorded_at: string
          patient_id: string
          recorded_by: string | null
          updated_at: string
          workload_factors: Json
          workload_level: string
          workload_score: number
        }
        Insert: {
          acuity_level?: string
          complexity_indicators?: Json
          computation_source?: string
          created_at?: string
          department?: Database["public"]["Enums"]["dept_code"] | null
          id?: string
          institution_id: string
          mews_current?: number | null
          mews_previous?: number | null
          mews_previous_at?: string | null
          mews_recorded_at?: string
          patient_id: string
          recorded_by?: string | null
          updated_at?: string
          workload_factors?: Json
          workload_level?: string
          workload_score?: number
        }
        Update: {
          acuity_level?: string
          complexity_indicators?: Json
          computation_source?: string
          created_at?: string
          department?: Database["public"]["Enums"]["dept_code"] | null
          id?: string
          institution_id?: string
          mews_current?: number | null
          mews_previous?: number | null
          mews_previous_at?: string | null
          mews_recorded_at?: string
          patient_id?: string
          recorded_by?: string | null
          updated_at?: string
          workload_factors?: Json
          workload_level?: string
          workload_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "patient_acuity_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_acuity_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_assignments: {
        Row: {
          active: boolean
          assigned_at: string
          care_role: string
          created_at: string
          employee_id: string
          ended_at: string | null
          id: string
          institution_id: string
          patient_id: string
          shift: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          assigned_at?: string
          care_role?: string
          created_at?: string
          employee_id: string
          ended_at?: string | null
          id?: string
          institution_id: string
          patient_id: string
          shift?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          assigned_at?: string
          care_role?: string
          created_at?: string
          employee_id?: string
          ended_at?: string | null
          id?: string
          institution_id?: string
          patient_id?: string
          shift?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_assignments_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_assignments_patient_id_fkey"
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
          institution_id: string | null
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
          institution_id?: string | null
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
          institution_id?: string | null
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
            foreignKeyName: "patients_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
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
          institution_id: string | null
          title: string
          updated_at: string
          username: string | null
        }
        Insert: {
          assigned_dept?: Database["public"]["Enums"]["dept_code"] | null
          created_at?: string
          full_name?: string
          id: string
          institution_id?: string | null
          title?: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          assigned_dept?: Database["public"]["Enums"]["dept_code"] | null
          created_at?: string
          full_name?: string
          id?: string
          institution_id?: string | null
          title?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
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
      workflow_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          department: Database["public"]["Enums"]["dept_code"] | null
          detail: string | null
          due_at: string | null
          id: string
          institution_id: string
          label: string
          patient_id: string | null
          status: string
          task_type: string
          time_sensitive: boolean
          updated_at: string
          weight: number
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          department?: Database["public"]["Enums"]["dept_code"] | null
          detail?: string | null
          due_at?: string | null
          id?: string
          institution_id: string
          label: string
          patient_id?: string | null
          status?: string
          task_type: string
          time_sensitive?: boolean
          updated_at?: string
          weight?: number
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          department?: Database["public"]["Enums"]["dept_code"] | null
          detail?: string | null
          due_at?: string | null
          id?: string
          institution_id?: string
          label?: string
          patient_id?: string | null
          status?: string
          task_type?: string
          time_sensitive?: boolean
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "workflow_tasks_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_tasks_patient_id_fkey"
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
