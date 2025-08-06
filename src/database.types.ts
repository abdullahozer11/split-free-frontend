export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      debts: {
        Row: {
          amount: number
          borrower: number
          created_at: string
          group_id: number
          id: number
          lender: number
        }
        Insert: {
          amount?: number
          borrower: number
          created_at?: string
          group_id: number
          id?: number
          lender: number
        }
        Update: {
          amount?: number
          borrower?: number
          created_at?: string
          group_id?: number
          id?: number
          lender?: number
        }
        Relationships: [
          {
            foreignKeyName: "debts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_Debt_borrower_fkey"
            columns: ["borrower"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_Debt_lender_fkey"
            columns: ["lender"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      debts_per_expense: {
        Row: {
          amount: number
          borrower: number
          created_at: string
          expense: number
          group_id: number
          id: number
          lender: number
        }
        Insert: {
          amount: number
          borrower: number
          created_at?: string
          expense: number
          group_id: number
          id?: number
          lender: number
        }
        Update: {
          amount?: number
          borrower?: number
          created_at?: string
          expense?: number
          group_id?: number
          id?: number
          lender?: number
        }
        Relationships: [
          {
            foreignKeyName: "debts_for_expense_borrower_fkey"
            columns: ["borrower"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debts_for_expense_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debts_for_expense_lender_fkey"
            columns: ["lender"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_debts_for_expense_expense_fkey"
            columns: ["expense"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_participants: {
        Row: {
          expense: number
          group_id: number
          id: number
          member: number
        }
        Insert: {
          expense: number
          group_id: number
          id?: number
          member: number
        }
        Update: {
          expense?: number
          group_id?: number
          id?: number
          member?: number
        }
        Relationships: [
          {
            foreignKeyName: "expense_participants_expense_fkey"
            columns: ["expense"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_participants_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_participants_member_fkey"
            columns: ["member"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_payers: {
        Row: {
          expense: number
          group_id: number
          id: number
          member: number
        }
        Insert: {
          expense: number
          group_id: number
          id?: number
          member: number
        }
        Update: {
          expense?: number
          group_id?: number
          id?: number
          member?: number
        }
        Relationships: [
          {
            foreignKeyName: "expense_payers_expense_fkey"
            columns: ["expense"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_payers_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_payers_member_fkey"
            columns: ["member"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          date: string
          description: string | null
          group_id: number
          id: number
          last_modified: string | null
          proof: string | null
          settled: boolean | null
          title: string
        }
        Insert: {
          amount?: number
          category?: string | null
          created_at?: string
          date?: string
          description?: string | null
          group_id: number
          id?: number
          last_modified?: string | null
          proof?: string | null
          settled?: boolean | null
          title: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          date?: string
          description?: string | null
          group_id?: number
          id?: number
          last_modified?: string | null
          proof?: string | null
          settled?: boolean | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_requests: {
        Row: {
          created_at: string
          id: number
          receiver: string
          sender: string
        }
        Insert: {
          created_at?: string
          id?: number
          receiver: string
          sender: string
        }
        Update: {
          created_at?: string
          id?: number
          receiver?: string
          sender?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_requests_receiver_fkey"
            columns: ["receiver"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_requests_sender_fkey"
            columns: ["sender"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friends: {
        Row: {
          created_at: string
          friend: string
          id: number
          profile: string
        }
        Insert: {
          created_at?: string
          friend?: string
          id?: number
          profile?: string
        }
        Update: {
          created_at?: string
          friend?: string
          id?: number
          profile?: string
        }
        Relationships: [
          {
            foreignKeyName: "friends_friend_fkey"
            columns: ["friend"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friends_profile_fkey"
            columns: ["profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_invitations: {
        Row: {
          created_at: string
          group_id: number
          group_name: string | null
          id: number
          receiver: string
          sender: string
        }
        Insert: {
          created_at?: string
          group_id: number
          group_name?: string | null
          id?: number
          receiver?: string
          sender?: string
        }
        Update: {
          created_at?: string
          group_id?: number
          group_name?: string | null
          id?: number
          receiver?: string
          sender?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_invitations_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_invitations_receiver_fkey"
            columns: ["receiver"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_invitations_sender_fkey"
            columns: ["sender"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          currency: string | null
          description: string | null
          expense_total: number
          id: number
          owner: string
          settled: boolean
          title: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          description?: string | null
          expense_total?: number
          id?: number
          owner: string
          settled?: boolean
          title: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          description?: string | null
          expense_total?: number
          id?: number
          owner?: string
          settled?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_groups_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_tokens: {
        Row: {
          created_at: string | null
          expires_at: string | null
          group_id: number
          id: string
          token: string
          used: boolean | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          group_id: number
          id?: string
          token: string
          used?: boolean | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          group_id?: number
          id?: string
          token?: string
          used?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "invite_tokens_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          created_at: string
          group_id: number
          id: number
          name: string
          profile: string | null
          role: string
          total_balance: number
          visible: boolean
        }
        Insert: {
          created_at?: string
          group_id: number
          id?: number
          name: string
          profile?: string | null
          role?: string
          total_balance?: number
          visible?: boolean
        }
        Update: {
          created_at?: string
          group_id?: number
          id?: number
          name?: string
          profile?: string | null
          role?: string
          total_balance?: number
          visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_Member_profile_fkey"
            columns: ["profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          email: string | null
          full_name: string | null
          id: string
          language: string | null
          phone_number: string | null
          receive_emails: boolean | null
          receive_popups: boolean | null
          total_balance: number
          total_payable: number
          total_receivable: number
          updated_at: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          language?: string | null
          phone_number?: string | null
          receive_emails?: boolean | null
          receive_popups?: boolean | null
          total_balance?: number
          total_payable?: number
          total_receivable?: number
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          language?: string | null
          phone_number?: string | null
          receive_emails?: boolean | null
          receive_popups?: boolean | null
          total_balance?: number
          total_payable?: number
          total_receivable?: number
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      transfers: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          group_id: number
          id: number
          receiver: number
          sender: number
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          group_id: number
          id?: number
          receiver: number
          sender: number
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          group_id?: number
          id?: number
          receiver?: number
          sender?: number
        }
        Relationships: [
          {
            foreignKeyName: "transfers_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_receiver_fkey"
            columns: ["receiver"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_sender_fkey"
            columns: ["sender"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_friend_request: {
        Args: { sender_uid: string }
        Returns: undefined
      }
      create_expense: {
        Args: {
          amount_input?: number
          category_input?: string
          date_input?: string
          description_input?: string
          group_id_input: number
          participants_input: number[]
          payers_input: number[]
          proof_input?: string
          title_input: string
        }
        Returns: number
      }
      create_group: {
        Args: {
          currency_input: string
          member_names_input: string[]
          title_input: string
        }
        Returns: number
      }
      deleteuser: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      exit_group: {
        Args: { _group_id: number; _profile_id: string }
        Returns: undefined
      }
      get_groups_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: number
          settled: boolean
          title: string
          expense_count: number
          member_count: number
        }[]
      }
      get_unbound_members_for_token: {
        Args: { p_token: string }
        Returns: {
          id: string
          name: string
        }[]
      }
      join_group_with_token: {
        Args: { p_member_id?: string; p_new_name?: string; p_token: string }
        Returns: undefined
      }
      search_friends: {
        Args: {
          keyword_input: string
          limit_input?: number
          offset_input?: number
          profile_id_input: string
        }
        Returns: {
          id: string
          email: string
          avatar_url: string
          friend_status: string
        }[]
      }
      self_assign_to: {
        Args: { _group_id: number; _member_id: number }
        Returns: undefined
      }
      settle_expense: {
        Args: { _group_id: number; expense_id: number }
        Returns: undefined
      }
      settle_group: {
        Args: { _id: number }
        Returns: undefined
      }
      update_expense: {
        Args: {
          amount_input?: number
          category_input?: string
          date_input?: string
          description_input?: string
          expense_id: number
          participants_input?: number[]
          payers_input?: number[]
          proof_input?: string
          title_input?: string
        }
        Returns: undefined
      }
      update_group: {
        Args: {
          description_input: string
          group_id_input: number
          member_names_input: string[]
          title_input: string
        }
        Returns: undefined
      }
      use_expense: {
        Args: { expense_id_input: number }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      balance_info: {
        id: number | null
        balance: number | null
      }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

