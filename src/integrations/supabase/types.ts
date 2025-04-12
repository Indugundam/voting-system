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
      candidates: {
        Row: {
          created_at: string | null
          election_id: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          election_id: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          election_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidates_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
        ]
      }
      election_data: {
        Row: {
          candidate_name: string
          election_date: string
          id: number
          votes: number
        }
        Insert: {
          candidate_name: string
          election_date: string
          id?: never
          votes: number
        }
        Update: {
          candidate_name?: string
          election_date?: string
          id?: never
          votes?: number
        }
        Relationships: []
      }
      elections: {
        Row: {
          created_at: string | null
          description: string
          id: string
          participant_count: number | null
          start_date: string
          status: string
          title: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          participant_count?: number | null
          start_date: string
          status: string
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          participant_count?: number | null
          start_date?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          voter_id: string | null
        }
        Insert: {
          created_at?: string | null
          full_name: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          voter_id?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          voter_id?: string | null
        }
        Relationships: []
      }
      purchased_tickets: {
        Row: {
          id: string
          purchase_date: string | null
          ticket_id: string
          ticket_number: string
          user_id: string
        }
        Insert: {
          id?: string
          purchase_date?: string | null
          ticket_id: string
          ticket_number: string
          user_id: string
        }
        Update: {
          id?: string
          purchase_date?: string | null
          ticket_id?: string
          ticket_number?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchased_tickets_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          created_at: string | null
          cuisine: string
          id: string
          image_url: string | null
          location: string
          name: string
          price_range: number | null
          rating: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          cuisine: string
          id?: string
          image_url?: string | null
          location: string
          name: string
          price_range?: number | null
          rating?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          cuisine?: string
          id?: string
          image_url?: string | null
          location?: string
          name?: string
          price_range?: number | null
          rating?: number | null
          user_id?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          created_at: string | null
          draw_time: string
          id: string
          name: string
          price: number
          tickets_left: number
        }
        Insert: {
          created_at?: string | null
          draw_time: string
          id?: string
          name: string
          price: number
          tickets_left?: number
        }
        Update: {
          created_at?: string | null
          draw_time?: string
          id?: string
          name?: string
          price?: number
          tickets_left?: number
        }
        Relationships: []
      }
      votes: {
        Row: {
          candidate_id: string
          created_at: string | null
          election_id: string
          id: string
          user_id: string
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          election_id: string
          id?: string
          user_id: string
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          election_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      election_results: {
        Row: {
          candidate_name: string | null
          election_date: string | null
          id: number | null
          votes: number | null
        }
        Insert: {
          candidate_name?: string | null
          election_date?: string | null
          id?: number | null
          votes?: number | null
        }
        Update: {
          candidate_name?: string | null
          election_date?: string | null
          id?: number | null
          votes?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_ticket_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      update_election_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      user_role: "admin" | "candidate" | "voter"
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
      user_role: ["admin", "candidate", "voter"],
    },
  },
} as const
