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
      domains: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      emails: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      list_members: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "created_by_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pco_connections: {
        Row: {
          access_token: string
          connected_by: string
          created_at: string
          id: number
          last_refreshed: string
          organization_id: string
          pco_user_id: string
          refresh_token: string
          scope: string
        }
        Insert: {
          access_token: string
          connected_by: string
          created_at?: string
          id?: number
          last_refreshed: string
          organization_id: string
          pco_user_id: string
          refresh_token: string
          scope: string
        }
        Update: {
          access_token?: string
          connected_by?: string
          created_at?: string
          id?: number
          last_refreshed?: string
          organization_id?: string
          pco_user_id?: string
          refresh_token?: string
          scope?: string
        }
        Relationships: [
          {
            foreignKeyName: "pco_connections_connected_by_fkey"
            columns: ["connected_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pco_connections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      pco_list_members: {
        Row: {
          created_at: string
          id: number
          organization_id: string
          pco_list_id: string
          pco_person_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          organization_id: string
          pco_list_id: string
          pco_person_id: string
        }
        Update: {
          created_at?: string
          id?: number
          organization_id?: string
          pco_list_id?: string
          pco_person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pco_list_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      pco_lists: {
        Row: {
          created_at: string
          id: number
          organization_id: string
          pco_last_refreshed_at: string | null
          pco_list_category_id: string | null
          pco_list_description: string
          pco_list_id: string
          pco_total_people: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          organization_id: string
          pco_last_refreshed_at?: string | null
          pco_list_category_id?: string | null
          pco_list_description: string
          pco_list_id: string
          pco_total_people?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          organization_id?: string
          pco_last_refreshed_at?: string | null
          pco_list_category_id?: string | null
          pco_list_description?: string
          pco_list_id?: string
          pco_total_people?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pco_lists_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      pco_sync_status: {
        Row: {
          created_at: string
          emails_synced: boolean
          emails_synced_at: string | null
          id: number
          list_results_synced: boolean
          list_results_synced_at: string | null
          lists_synced: boolean
          lists_synced_at: string | null
          organization_id: string
        }
        Insert: {
          created_at?: string
          emails_synced?: boolean
          emails_synced_at?: string | null
          id?: number
          list_results_synced?: boolean
          list_results_synced_at?: string | null
          lists_synced?: boolean
          lists_synced_at?: string | null
          organization_id: string
        }
        Update: {
          created_at?: string
          emails_synced?: boolean
          emails_synced_at?: string | null
          id?: number
          list_results_synced?: boolean
          list_results_synced_at?: string | null
          lists_synced?: boolean
          lists_synced_at?: string | null
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pco_sync_status_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      pco_webhooks: {
        Row: {
          authenticity_secret: string | null
          created_at: string
          id: string
          name: string
          organization_id: string
          webhook_id: string | null
        }
        Insert: {
          authenticity_secret?: string | null
          created_at?: string
          id?: string
          name: string
          organization_id: string
          webhook_id?: string | null
        }
        Update: {
          authenticity_secret?: string | null
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pco_webhooks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      people_emails: {
        Row: {
          created_at: string
          email: string
          id: number
          organization_id: string
          pco_email_id: string
          pco_person_id: string
          status: Database["public"]["Enums"]["email_status"]
          unsubscribe_email_id: number | null
          unsubscribe_time: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          organization_id: string
          pco_email_id: string
          pco_person_id: string
          status?: Database["public"]["Enums"]["email_status"]
          unsubscribe_email_id?: number | null
          unsubscribe_time?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          organization_id?: string
          pco_email_id?: string
          pco_person_id?: string
          status?: Database["public"]["Enums"]["email_status"]
          unsubscribe_email_id?: number | null
          unsubscribe_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "people_emails_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "people_emails_unsubscribe_email_id_fkey"
            columns: ["unsubscribe_email_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          organization_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          organization_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      email_status: "unsubscribed" | "pco_blocked" | "subscribed"
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
