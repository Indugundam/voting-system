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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
