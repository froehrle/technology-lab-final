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
      achievements: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          xp_required: number
        }
        Insert: {
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          xp_required: number
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          xp_required?: number
        }
        Relationships: []
      }
      avatar_items: {
        Row: {
          created_at: string
          css_class: string
          description: string | null
          id: string
          name: string
          price: number
          rarity: string | null
          type: string
        }
        Insert: {
          created_at?: string
          css_class: string
          description?: string | null
          id?: string
          name: string
          price: number
          rarity?: string | null
          type: string
        }
        Update: {
          created_at?: string
          css_class?: string
          description?: string | null
          id?: string
          name?: string
          price?: number
          rarity?: string | null
          type?: string
        }
        Relationships: []
      }
      course_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string
          id: string
          progress: number | null
          student_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string
          id?: string
          progress?: number | null
          student_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string
          id?: string
          progress?: number | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_completion_stats"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          description: string | null
          id: string
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      farm_items: {
        Row: {
          created_at: string
          description: string | null
          grid_x: number
          grid_y: number
          height: number | null
          icon: string
          id: string
          name: string
          prerequisite_item_id: string | null
          price: number
          purchase_order: number | null
          rarity: string | null
          type: string
          width: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          grid_x: number
          grid_y: number
          height?: number | null
          icon: string
          id?: string
          name: string
          prerequisite_item_id?: string | null
          price: number
          purchase_order?: number | null
          rarity?: string | null
          type: string
          width?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          grid_x?: number
          grid_y?: number
          height?: number | null
          icon?: string
          id?: string
          name?: string
          prerequisite_item_id?: string | null
          price?: number
          purchase_order?: number | null
          rarity?: string | null
          type?: string
          width?: number | null
        }
        Relationships: []
      }
      profile_badges: {
        Row: {
          badge_type: string
          created_at: string
          description: string | null
          icon: string
          id: string
          is_purchasable: boolean
          name: string
          price: number
          rarity: string
        }
        Insert: {
          badge_type: string
          created_at?: string
          description?: string | null
          icon: string
          id?: string
          is_purchasable?: boolean
          name: string
          price: number
          rarity?: string
        }
        Update: {
          badge_type?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_purchasable?: boolean
          name?: string
          price?: number
          rarity?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          role: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_answer: string | null
          course_id: string
          created_at: string
          id: string
          options: Json | null
          question_text: string
          question_type: string
          updated_at: string
        }
        Insert: {
          correct_answer?: string | null
          course_id: string
          created_at?: string
          id?: string
          options?: Json | null
          question_text: string
          question_type?: string
          updated_at?: string
        }
        Update: {
          correct_answer?: string | null
          course_id?: string
          created_at?: string
          id?: string
          options?: Json | null
          question_text?: string
          question_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_completion_stats"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "questions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string
          current_question_index: number | null
          current_score: number | null
          focus_points: number | null
          id: string
          is_completed: boolean | null
          lives_remaining: number | null
          student_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          current_question_index?: number | null
          current_score?: number | null
          focus_points?: number | null
          id?: string
          is_completed?: boolean | null
          lives_remaining?: number | null
          student_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          current_question_index?: number | null
          current_score?: number | null
          focus_points?: number | null
          id?: string
          is_completed?: boolean | null
          lives_remaining?: number | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_completion_stats"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "quiz_attempts_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      student_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          student_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          student_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      student_answers: {
        Row: {
          answered_at: string
          attempt_count: number | null
          id: string
          is_correct: boolean
          question_id: string
          selected_answer: string
          student_id: string
          xp_earned: number | null
        }
        Insert: {
          answered_at?: string
          attempt_count?: number | null
          id?: string
          is_correct: boolean
          question_id: string
          selected_answer: string
          student_id: string
          xp_earned?: number | null
        }
        Update: {
          answered_at?: string
          attempt_count?: number | null
          id?: string
          is_correct?: boolean
          question_id?: string
          selected_answer?: string
          student_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "difficult_questions_stats"
            referencedColumns: ["question_id"]
          },
          {
            foreignKeyName: "student_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      student_badge_purchases: {
        Row: {
          badge_id: string
          id: string
          is_equipped: boolean
          purchased_at: string
          student_id: string
        }
        Insert: {
          badge_id: string
          id?: string
          is_equipped?: boolean
          purchased_at?: string
          student_id: string
        }
        Update: {
          badge_id?: string
          id?: string
          is_equipped?: boolean
          purchased_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_badge_purchases_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "profile_badges"
            referencedColumns: ["id"]
          },
        ]
      }
      student_coins: {
        Row: {
          created_at: string
          id: string
          student_id: string
          total_coins: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          student_id: string
          total_coins?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          student_id?: string
          total_coins?: number
          updated_at?: string
        }
        Relationships: []
      }
      student_farm_purchases: {
        Row: {
          farm_item_id: string
          id: string
          is_placed: boolean | null
          purchased_at: string
          student_id: string
        }
        Insert: {
          farm_item_id: string
          id?: string
          is_placed?: boolean | null
          purchased_at?: string
          student_id: string
        }
        Update: {
          farm_item_id?: string
          id?: string
          is_placed?: boolean | null
          purchased_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_farm_purchases_farm_item_id_fkey"
            columns: ["farm_item_id"]
            isOneToOne: false
            referencedRelation: "farm_items"
            referencedColumns: ["id"]
          },
        ]
      }
      student_purchases: {
        Row: {
          id: string
          is_equipped: boolean | null
          item_id: string | null
          purchase_type: string
          purchased_at: string
          student_id: string
        }
        Insert: {
          id?: string
          is_equipped?: boolean | null
          item_id?: string | null
          purchase_type: string
          purchased_at?: string
          student_id: string
        }
        Update: {
          id?: string
          is_equipped?: boolean | null
          item_id?: string | null
          purchase_type?: string
          purchased_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_purchases_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "avatar_items"
            referencedColumns: ["id"]
          },
        ]
      }
      student_streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_activity_date: string | null
          longest_streak: number
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_xp: {
        Row: {
          created_at: string
          id: string
          student_id: string
          total_xp: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          student_id: string
          total_xp?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          student_id?: string
          total_xp?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      course_completion_stats: {
        Row: {
          completion_rate: number | null
          completions: number | null
          course_id: string | null
          teacher_id: string | null
          title: string | null
          total_enrollments: number | null
        }
        Relationships: []
      }
      difficult_questions_stats: {
        Row: {
          avg_attempts: number | null
          course_id: string | null
          course_title: string | null
          question_id: string | null
          question_text: string | null
          total_answers: number | null
          wrong_answers: number | null
          wrong_percentage: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_completion_stats"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "questions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      dropout_analysis: {
        Row: {
          course_title: string | null
          current_question_index: number | null
          dropout_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_perfect_completions: {
        Args: { course_ids: string[] }
        Returns: number
      }
      reset_inactive_streaks: {
        Args: Record<PropertyKey, never>
        Returns: number
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
    Enums: {},
  },
} as const
