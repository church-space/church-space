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
          organization_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          organization_id: string
        }
        Update: {
          created_at?: string
          id?: number
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "domains_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_blocks: {
        Row: {
          created_at: string
          id: number
          parent_id: number | null
          section_id: number
          type: Database["public"]["Enums"]["block_types"]
          value: Json | null
        }
        Insert: {
          created_at?: string
          id?: number
          parent_id?: number | null
          section_id: number
          type: Database["public"]["Enums"]["block_types"]
          value?: Json | null
        }
        Update: {
          created_at?: string
          id?: number
          parent_id?: number | null
          section_id?: number
          type?: Database["public"]["Enums"]["block_types"]
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_blocks_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "email_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_blocks_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "email_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      email_categories: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          organization_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
          organization_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_footer_details: {
        Row: {
          created_at: string
          id: number
          organization_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          organization_id: string
        }
        Update: {
          created_at?: string
          id?: number
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_footer_details_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_link_clicks: {
        Row: {
          created_at: string
          id: number
          link_clicked: string
          resend_email_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          link_clicked: string
          resend_email_id: string
        }
        Update: {
          created_at?: string
          id?: number
          link_clicked?: string
          resend_email_id?: string
        }
        Relationships: []
      }
      email_recipients: {
        Row: {
          created_at: string
          email_address: string | null
          email_id: number
          id: number
          resend_email_id: string | null
          status: Database["public"]["Enums"]["email_delivery_status"] | null
        }
        Insert: {
          created_at?: string
          email_address?: string | null
          email_id: number
          id?: number
          resend_email_id?: string | null
          status?: Database["public"]["Enums"]["email_delivery_status"] | null
        }
        Update: {
          created_at?: string
          email_address?: string | null
          email_id?: number
          id?: number
          resend_email_id?: string | null
          status?: Database["public"]["Enums"]["email_delivery_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "email_recipients_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sections: {
        Row: {
          bg_color: string | null
          created_at: string
          email_id: number
          id: number
          parent: number | null
        }
        Insert: {
          bg_color?: string | null
          created_at?: string
          email_id: number
          id?: number
          parent?: number | null
        }
        Update: {
          bg_color?: string | null
          created_at?: string
          email_id?: number
          id?: number
          parent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "email_sections_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sections_parent_fkey"
            columns: ["parent"]
            isOneToOne: false
            referencedRelation: "email_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      emails: {
        Row: {
          bg_color: string | null
          created_at: string
          font: string | null
          from_email: string | null
          from_name: string | null
          id: number
          list_id: number | null
          organization_id: string
          reply_to: string | null
          scheduled_for: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["email_statuses"] | null
          subject: string | null
          text_color: string | null
          trigger_dev_schduled_id: string | null
          type: Database["public"]["Enums"]["email_types"]
          updated_at: string | null
        }
        Insert: {
          bg_color?: string | null
          created_at?: string
          font?: string | null
          from_email?: string | null
          from_name?: string | null
          id?: number
          list_id?: number | null
          organization_id: string
          reply_to?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["email_statuses"] | null
          subject?: string | null
          text_color?: string | null
          trigger_dev_schduled_id?: string | null
          type?: Database["public"]["Enums"]["email_types"]
          updated_at?: string | null
        }
        Update: {
          bg_color?: string | null
          created_at?: string
          font?: string | null
          from_email?: string | null
          from_name?: string | null
          id?: number
          list_id?: number | null
          organization_id?: string
          reply_to?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["email_statuses"] | null
          subject?: string | null
          text_color?: string | null
          trigger_dev_schduled_id?: string | null
          type?: Database["public"]["Enums"]["email_types"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emails_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "pco_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emails_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          created_at: string
          email: string
          id: number
          invited_by: string | null
          organization_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          invited_by?: string | null
          organization_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          invited_by?: string | null
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      list_automations: {
        Row: {
          condition: Database["public"]["Enums"]["automation_conditions"]
          created_at: string
          email_to_send: number | null
          id: number
          list_id: number
        }
        Insert: {
          condition?: Database["public"]["Enums"]["automation_conditions"]
          created_at?: string
          email_to_send?: number | null
          id?: number
          list_id: number
        }
        Update: {
          condition?: Database["public"]["Enums"]["automation_conditions"]
          created_at?: string
          email_to_send?: number | null
          id?: number
          list_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "list_automations_email_to_send_fkey"
            columns: ["email_to_send"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_automations_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "pco_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_memberships: {
        Row: {
          created_at: string
          id: number
          organization_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          organization_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          organization_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          pco_organization_id: string
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
          pco_organization_id: string
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
          pco_organization_id?: string
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
          id: number
          organization_id: string
          synced_at: string | null
          type: Database["public"]["Enums"]["pco_sync_types"] | null
        }
        Insert: {
          created_at?: string
          id?: number
          organization_id: string
          synced_at?: string | null
          type?: Database["public"]["Enums"]["pco_sync_types"] | null
        }
        Update: {
          created_at?: string
          id?: number
          organization_id?: string
          synced_at?: string | null
          type?: Database["public"]["Enums"]["pco_sync_types"] | null
        }
        Relationships: [
          {
            foreignKeyName: "pco_sync_status_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
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
      people: {
        Row: {
          created_at: string
          first_name: string | null
          given_name: string | null
          id: number
          last_name: string | null
          middle_name: string | null
          nickname: string | null
          organization_id: string
          pco_id: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          given_name?: string | null
          id?: number
          last_name?: string | null
          middle_name?: string | null
          nickname?: string | null
          organization_id: string
          pco_id: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          given_name?: string | null
          id?: number
          last_name?: string | null
          middle_name?: string | null
          nickname?: string | null
          organization_id?: string
          pco_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "people_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      people_email_unsubscribes: {
        Row: {
          category_id: number | null
          created_at: string
          email_address: string
          id: number
          organization_id: string
          reason: string | null
          unsub_email_id: number | null
        }
        Insert: {
          category_id?: number | null
          created_at?: string
          email_address: string
          id?: number
          organization_id: string
          reason?: string | null
          unsub_email_id?: number | null
        }
        Update: {
          category_id?: number | null
          created_at?: string
          email_address?: string
          id?: number
          organization_id?: string
          reason?: string | null
          unsub_email_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "people_email_unsubscribes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "email_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "people_email_unsubscribes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "people_email_unsubscribes_unsub_email_id_fkey"
            columns: ["unsub_email_id"]
            isOneToOne: false
            referencedRelation: "emails"
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
          status: Database["public"]["Enums"]["email_address_status"]
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          organization_id: string
          pco_email_id: string
          pco_person_id: string
          status?: Database["public"]["Enums"]["email_address_status"]
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          organization_id?: string
          pco_email_id?: string
          pco_person_id?: string
          status?: Database["public"]["Enums"]["email_address_status"]
        }
        Relationships: [
          {
            foreignKeyName: "people_emails_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      pinned_email_templates: {
        Row: {
          created_at: string
          email_id: number | null
          id: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email_id?: number | null
          id?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email_id?: number | null
          id?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pinned_emails_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pinned_emails_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pinned_lists: {
        Row: {
          created_at: string
          id: number
          list_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          list_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          list_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pinned_lists_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "pco_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pinned_lists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
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
      subscriptions: {
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
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      automation_conditions: "added_to_list" | "removed_from_list"
      block_types:
        | "cards"
        | "button"
        | "text"
        | "divider"
        | "video"
        | "file-download"
        | "image"
        | "spacer"
      email_address_status: "unsubscribed" | "pco_blocked" | "subscribed"
      email_delivery_status:
        | "sent"
        | "delivered"
        | "delivery_delayed"
        | "complained"
        | "bounced"
        | "opened"
      email_statuses: "draft" | "sent" | "sending" | "scheduled"
      email_types: "standard" | "template"
      pco_sync_types: "lists" | "emails"
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
