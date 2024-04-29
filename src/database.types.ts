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
          group_id: number | null
          id: number
          owner: number | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          group_id?: number | null
          id?: number
          owner?: number | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          group_id?: number | null
          id?: number
          owner?: number | null
        }
        Relationships: [
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
      expense_participants: {
        Row: {
          expense: number | null
          id: number
          member: number | null
        }
        Insert: {
          expense?: number | null
          id?: number
          member?: number | null
        }
        Update: {
          expense?: number | null
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
          id: number
          member: number | null
        }
        Insert: {
          expense?: number | null
          id?: number
          member?: number | null
        }
        Update: {
          expense?: number | null
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
          proof: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          date?: string
          description?: string | null
          group_id?: number | null
          id?: number
          proof?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          date?: string
          description?: string | null
          group_id?: number | null
          id?: number
          proof?: string | null
          title?: string
          updated_at?: string | null
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
      friends: {
        Row: {
          created_at: string
          friend: string
          id: number
          profile: string
        }
        Insert: {
          created_at?: string
          friend: string
          id?: number
          profile: string
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
          id: number
          owner: string | null
          status: string
          title: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          owner?: string | null
          status?: string
          title?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
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
        }
        Insert: {
          created_at?: string
          group_id: number
          id?: number
          name: string
          profile?: string | null
          role?: string
        }
        Update: {
          created_at?: string
          group_id?: number
          id?: number
          name?: string
          profile?: string | null
          role?: string
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
          balance: number
          full_name: string | null
          id: string
          phone_number: string | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          balance?: number
          full_name?: string | null
          id: string
          phone_number?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          balance?: number
          full_name?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string | null
          username?: string | null
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
      create_group: {
        Args: {
          profile_id_input: string
          title_input: string
          member_names_input: string[]
        }
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
