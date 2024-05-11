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
      activities: {
        Row: {
          created_at: string
          group_id: number | null
          id: number
          member: number
          text: string
        }
        Insert: {
          created_at?: string
          group_id?: number | null
          id?: number
          member: number
          text: string
        }
        Update: {
          created_at?: string
          group_id?: number | null
          id?: number
          member?: number
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_Activity_member_fkey"
            columns: ["member"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      balances: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          expense: number | null
          group_id: number | null
          id: number
          owner: number | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          expense?: number | null
          group_id?: number | null
          id?: number
          owner?: number | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          expense?: number | null
          group_id?: number | null
          id?: number
          owner?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "balances_expense_fkey"
            columns: ["expense"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "balances_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_Balance_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      debts: {
        Row: {
          amount: number
          borrower: number
          created_at: string
          currency: string
          group_id: number | null
          id: number
          lender: number
        }
        Insert: {
          amount?: number
          borrower: number
          created_at?: string
          currency?: string
          group_id?: number | null
          id?: number
          lender: number
        }
        Update: {
          amount?: number
          borrower?: number
          created_at?: string
          currency?: string
          group_id?: number | null
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
      expense_categories: {
        Row: {
          embedding: string | null
          id: number
          name: string
        }
        Insert: {
          embedding?: string | null
          id?: number
          name: string
        }
        Update: {
          embedding?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      expense_participants: {
        Row: {
          expense: number | null
          group_id: number | null
          id: number
          member: number | null
        }
        Insert: {
          expense?: number | null
          group_id?: number | null
          id?: number
          member?: number | null
        }
        Update: {
          expense?: number | null
          group_id?: number | null
          id?: number
          member?: number | null
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
          expense: number | null
          group_id: number | null
          id: number
          member: number | null
        }
        Insert: {
          expense?: number | null
          group_id?: number | null
          id?: number
          member?: number | null
        }
        Update: {
          expense?: number | null
          group_id?: number | null
          id?: number
          member?: number | null
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
          created_at: string
          currency: string
          date: string
          description: string | null
          group_id: number | null
          id: number
          last_modified: string | null
          proof: string | null
          title: string
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          date?: string
          description?: string | null
          group_id?: number | null
          id?: number
          last_modified?: string | null
          proof?: string | null
          title: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          date?: string
          description?: string | null
          group_id?: number | null
          id?: number
          last_modified?: string | null
          proof?: string | null
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
      groups: {
        Row: {
          created_at: string
          description: string | null
          expense_total: number
          id: number
          newly_created: boolean
          owner: string | null
          status: string
          title: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          expense_total?: number
          id?: number
          newly_created?: boolean
          owner?: string | null
          status?: string
          title?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          expense_total?: number
          id?: number
          newly_created?: boolean
          owner?: string | null
          status?: string
          title?: string | null
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
      members: {
        Row: {
          created_at: string
          group_id: number
          id: number
          name: string
          profile: string | null
          role: string
          total_balance: number
        }
        Insert: {
          created_at?: string
          group_id: number
          id?: number
          name: string
          profile?: string | null
          role?: string
          total_balance?: number
        }
        Update: {
          created_at?: string
          group_id?: number
          id?: number
          name?: string
          profile?: string | null
          role?: string
          total_balance?: number
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
          phone_number: string | null
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
          phone_number?: string | null
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
          phone_number?: string | null
          total_balance?: number
          total_payable?: number
          total_receivable?: number
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_new_debts: {
        Args: {
          group_id_input: number
        }
        Returns: undefined
      }
      create_expense: {
        Args: {
          group_id_input: number
          title_input: string
          description_input: string
          amount_input: number
          currency_input: string
          date_input: string
          proof_input: string
          payers_input: number[]
          participants_input: number[]
        }
        Returns: number
      }
      create_group: {
        Args: {
          title_input: string
          member_names_input: string[]
        }
        Returns: number
      }
      debug_query: {
        Args: {
          profile_id_input: string
          keyword_input: string
          limit_input: number
          offset_input: number
        }
        Returns: {
          id: string
          email: string
          avatar_url: string
          friend_status: string
        }[]
      }
      get_debts_from: {
        Args: {
          group_id_input: number
          selection: Database["public"]["CompositeTypes"]["balance_info"][]
        }
        Returns: undefined
      }
      get_friends: {
        Args: {
          profile_id_input: string
        }
        Returns: {
          id: string
          full_name: string
          avatar_url: string
          balance: number
          email: string
        }[]
      }
      get_selection_with_sum: {
        Args: {
          target_sum: number
          selection_length: number
          balances: Database["public"]["CompositeTypes"]["balance_info"][]
        }
        Returns: Database["public"]["CompositeTypes"]["balance_info"][]
      }
      is_group_owner: {
        Args: {
          _person_id: string
          _group_id: number
        }
        Returns: boolean
      }
      is_member_of: {
        Args: {
          _person_id: string
          _group_id: number
        }
        Returns: boolean
      }
      post_expense: {
        Args: {
          group_id_input: number
        }
        Returns: undefined
      }
      recalculate_total_balance: {
        Args: {
          group_id_input: number
        }
        Returns: undefined
      }
      recalculate_total_expense: {
        Args: {
          group_id_input: number
        }
        Returns: undefined
      }
      remove_selection_from_balances: {
        Args: {
          _balances: Database["public"]["CompositeTypes"]["balance_info"][]
          _selection: Database["public"]["CompositeTypes"]["balance_info"][]
        }
        Returns: Database["public"]["CompositeTypes"]["balance_info"][]
      }
      search_friends: {
        Args: {
          keyword_input: string
          profile_id_input: string
          limit_input?: number
          offset_input?: number
        }
        Returns: {
          id: string
          email: string
          avatar_url: string
          friend_status: string
        }[]
      }
      update_expense: {
        Args: {
          expense_id: number
          title_input: string
          description_input: string
          amount_input: number
          date_input: string
          currency_input: string
          proof_input: string
          payers_input: number[]
          participants_input: number[]
        }
        Returns: undefined
      }
      update_group: {
        Args: {
          group_id_input: number
          title_input: string
          description_input: string
          member_names_input: string[]
        }
        Returns: undefined
      }
      update_profile_balance: {
        Args: {
          group_id_input: number
        }
        Returns: undefined
      }
      use_expense: {
        Args: {
          expense_id_input: number
        }
        Returns: {
          amount: number
          id: number
          title: string
          currency: string
          description: string
          date: string
          last_modified: string
          group_id: number
          payers: Json
          participants: Json
          payer_ids: Json
          participant_ids: Json
        }[]
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
