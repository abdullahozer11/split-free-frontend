export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      balances: {
        Row: {
          amount: number;
          created_at: string;
          currency: string;
          expense: number;
          group_id: number;
          id: number;
          owner: number;
        };
        Insert: {
          amount?: number;
          created_at?: string;
          currency?: string;
          expense: number;
          group_id: number;
          id?: number;
          owner: number;
        };
        Update: {
          amount?: number;
          created_at?: string;
          currency?: string;
          expense?: number;
          group_id?: number;
          id?: number;
          owner?: number;
        };
        Relationships: [
          {
            foreignKeyName: "balances_expense_fkey";
            columns: ["expense"];
            isOneToOne: false;
            referencedRelation: "expenses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "balances_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_Balance_owner_fkey";
            columns: ["owner"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      debts: {
        Row: {
          amount: number;
          borrower: number;
          created_at: string;
          currency: string;
          group_id: number;
          id: number;
          lender: number;
        };
        Insert: {
          amount?: number;
          borrower: number;
          created_at?: string;
          currency?: string;
          group_id: number;
          id?: number;
          lender: number;
        };
        Update: {
          amount?: number;
          borrower?: number;
          created_at?: string;
          currency?: string;
          group_id?: number;
          id?: number;
          lender?: number;
        };
        Relationships: [
          {
            foreignKeyName: "debts_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_Debt_borrower_fkey";
            columns: ["borrower"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_Debt_lender_fkey";
            columns: ["lender"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      debts_for_expense: {
        Row: {
          amount: number;
          borrower: number;
          created_at: string;
          currency: string;
          expense: number;
          group_id: number;
          id: number;
          lender: number;
        };
        Insert: {
          amount: number;
          borrower: number;
          created_at?: string;
          currency?: string;
          expense: number;
          group_id: number;
          id?: number;
          lender: number;
        };
        Update: {
          amount?: number;
          borrower?: number;
          created_at?: string;
          currency?: string;
          expense?: number;
          group_id?: number;
          id?: number;
          lender?: number;
        };
        Relationships: [
          {
            foreignKeyName: "debts_for_expense_borrower_fkey";
            columns: ["borrower"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "debts_for_expense_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "debts_for_expense_lender_fkey";
            columns: ["lender"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_debts_for_expense_expense_fkey";
            columns: ["expense"];
            isOneToOne: false;
            referencedRelation: "expenses";
            referencedColumns: ["id"];
          },
        ];
      };
      debts_simple: {
        Row: {
          amount: number;
          borrower: number;
          created_at: string;
          currency: string;
          group_id: number;
          id: number;
          lender: number;
        };
        Insert: {
          amount?: number;
          borrower: number;
          created_at?: string;
          currency?: string;
          group_id: number;
          id?: number;
          lender: number;
        };
        Update: {
          amount?: number;
          borrower?: number;
          created_at?: string;
          currency?: string;
          group_id?: number;
          id?: number;
          lender?: number;
        };
        Relationships: [
          {
            foreignKeyName: "public_debts_simple_borrower_fkey";
            columns: ["borrower"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_debts_simple_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_debts_simple_lender_fkey";
            columns: ["lender"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      expense_participants: {
        Row: {
          expense: number;
          group_id: number;
          id: number;
          member: number;
        };
        Insert: {
          expense: number;
          group_id: number;
          id?: number;
          member: number;
        };
        Update: {
          expense?: number;
          group_id?: number;
          id?: number;
          member?: number;
        };
        Relationships: [
          {
            foreignKeyName: "expense_participants_expense_fkey";
            columns: ["expense"];
            isOneToOne: false;
            referencedRelation: "expenses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expense_participants_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expense_participants_member_fkey";
            columns: ["member"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      expense_payers: {
        Row: {
          expense: number;
          group_id: number;
          id: number;
          member: number;
        };
        Insert: {
          expense: number;
          group_id: number;
          id?: number;
          member: number;
        };
        Update: {
          expense?: number;
          group_id?: number;
          id?: number;
          member?: number;
        };
        Relationships: [
          {
            foreignKeyName: "expense_payers_expense_fkey";
            columns: ["expense"];
            isOneToOne: false;
            referencedRelation: "expenses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expense_payers_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expense_payers_member_fkey";
            columns: ["member"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      expenses: {
        Row: {
          amount: number;
          category: string | null;
          created_at: string;
          currency: string;
          date: string;
          description: string | null;
          group_id: number;
          id: number;
          last_modified: string | null;
          proof: string | null;
          settled: boolean | null;
          title: string;
        };
        Insert: {
          amount?: number;
          category?: string | null;
          created_at?: string;
          currency?: string;
          date?: string;
          description?: string | null;
          group_id: number;
          id?: number;
          last_modified?: string | null;
          proof?: string | null;
          settled?: boolean | null;
          title: string;
        };
        Update: {
          amount?: number;
          category?: string | null;
          created_at?: string;
          currency?: string;
          date?: string;
          description?: string | null;
          group_id?: number;
          id?: number;
          last_modified?: string | null;
          proof?: string | null;
          settled?: boolean | null;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "expenses_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
        ];
      };
      friend_requests: {
        Row: {
          created_at: string;
          id: number;
          receiver: string;
          sender: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          receiver: string;
          sender: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          receiver?: string;
          sender?: string;
        };
        Relationships: [
          {
            foreignKeyName: "friend_requests_receiver_fkey";
            columns: ["receiver"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "friend_requests_sender_fkey";
            columns: ["sender"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      friends: {
        Row: {
          created_at: string;
          friend: string;
          id: number;
          profile: string;
        };
        Insert: {
          created_at?: string;
          friend?: string;
          id?: number;
          profile?: string;
        };
        Update: {
          created_at?: string;
          friend?: string;
          id?: number;
          profile?: string;
        };
        Relationships: [
          {
            foreignKeyName: "friends_friend_fkey";
            columns: ["friend"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "friends_profile_fkey";
            columns: ["profile"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      group_invitations: {
        Row: {
          created_at: string;
          group_id: number;
          group_name: string | null;
          id: number;
          receiver: string;
          sender: string;
        };
        Insert: {
          created_at?: string;
          group_id: number;
          group_name?: string | null;
          id?: number;
          receiver?: string;
          sender?: string;
        };
        Update: {
          created_at?: string;
          group_id?: number;
          group_name?: string | null;
          id?: number;
          receiver?: string;
          sender?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_invitations_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "group_invitations_receiver_fkey";
            columns: ["receiver"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "group_invitations_sender_fkey";
            columns: ["sender"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      groups: {
        Row: {
          created_at: string;
          description: string | null;
          expense_total: number;
          id: number;
          owner: string;
          settled: boolean;
          title: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          expense_total?: number;
          id?: number;
          owner: string;
          settled?: boolean;
          title: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          expense_total?: number;
          id?: number;
          owner?: string;
          settled?: boolean;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_groups_owner_fkey";
            columns: ["owner"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      members: {
        Row: {
          created_at: string;
          group_id: number;
          id: number;
          name: string;
          profile: string | null;
          role: string;
          total_balance: number;
          visible: boolean;
        };
        Insert: {
          created_at?: string;
          group_id: number;
          id?: number;
          name: string;
          profile?: string | null;
          role?: string;
          total_balance?: number;
          visible?: boolean;
        };
        Update: {
          created_at?: string;
          group_id?: number;
          id?: number;
          name?: string;
          profile?: string | null;
          role?: string;
          total_balance?: number;
          visible?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "members_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_Member_profile_fkey";
            columns: ["profile"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          currency: string;
          email: string | null;
          full_name: string | null;
          id: string;
          language: string | null;
          phone_number: string | null;
          receive_emails: boolean | null;
          receive_popups: boolean | null;
          total_balance: number;
          total_payable: number;
          total_receivable: number;
          updated_at: string | null;
          website: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          currency?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          language?: string | null;
          phone_number?: string | null;
          receive_emails?: boolean | null;
          receive_popups?: boolean | null;
          total_balance?: number;
          total_payable?: number;
          total_receivable?: number;
          updated_at?: string | null;
          website?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          currency?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          language?: string | null;
          phone_number?: string | null;
          receive_emails?: boolean | null;
          receive_popups?: boolean | null;
          total_balance?: number;
          total_payable?: number;
          total_receivable?: number;
          updated_at?: string | null;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      transfers: {
        Row: {
          amount: number;
          created_at: string;
          description: string | null;
          group_id: number;
          id: number;
          receiver: number;
          sender: number;
        };
        Insert: {
          amount: number;
          created_at?: string;
          description?: string | null;
          group_id: number;
          id?: number;
          receiver: number;
          sender: number;
        };
        Update: {
          amount?: number;
          created_at?: string;
          description?: string | null;
          group_id?: number;
          id?: number;
          receiver?: number;
          sender?: number;
        };
        Relationships: [
          {
            foreignKeyName: "transfers_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transfers_receiver_fkey";
            columns: ["receiver"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transfers_sender_fkey";
            columns: ["sender"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_friend_request: {
        Args: {
          sender_uid: string;
        };
        Returns: undefined;
      };
      create_expense: {
        Args: {
          group_id_input: number;
          title_input: string;
          description_input: string;
          amount_input: number;
          currency_input: string;
          date_input: string;
          proof_input: string;
          payers_input: number[];
          participants_input: number[];
          category_input?: string;
        };
        Returns: number;
      };
      create_group: {
        Args: {
          title_input: string;
          member_names_input: string[];
        };
        Returns: number;
      };
      deleteuser: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      exit_group: {
        Args: {
          _profile_id: string;
          _group_id: number;
        };
        Returns: undefined;
      };
      get_groups_summary: {
        Args: Record<PropertyKey, never>;
        Returns: {
          id: number;
          settled: boolean;
          title: string;
          expense_count: number;
          member_count: number;
        }[];
      };
      search_friends: {
        Args: {
          keyword_input: string;
          profile_id_input: string;
          limit_input?: number;
          offset_input?: number;
        };
        Returns: {
          id: string;
          email: string;
          avatar_url: string;
          friend_status: string;
        }[];
      };
      self_assign_to: {
        Args: {
          _member_id: number;
          _group_id: number;
        };
        Returns: undefined;
      };
      settle_expense: {
        Args: {
          expense_id: number;
          _group_id: number;
        };
        Returns: undefined;
      };
      settle_group: {
        Args: {
          _id: number;
        };
        Returns: undefined;
      };
      update_expense: {
        Args: {
          expense_id: number;
          title_input: string;
          description_input: string;
          amount_input: number;
          date_input: string;
          currency_input: string;
          proof_input: string;
          payers_input: number[];
          participants_input: number[];
          category_input?: string;
        };
        Returns: undefined;
      };
      update_group: {
        Args: {
          group_id_input: number;
          title_input: string;
          description_input: string;
          member_names_input: string[];
        };
        Returns: undefined;
      };
      use_expense: {
        Args: {
          expense_id_input: number;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      balance_info: {
        id: number | null;
        balance: number | null;
      };
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

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
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

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
    : never;
