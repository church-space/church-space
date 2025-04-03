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
      course_blocks: {
        Row: {
          course_id: number
          created_at: string
          id: number
          linked_file: string | null
          order: number | null
          type: Database["public"]["Enums"]["block_types"]
          value: Json | null
        }
        Insert: {
          course_id: number
          created_at?: string
          id?: number
          linked_file?: string | null
          order?: number | null
          type: Database["public"]["Enums"]["block_types"]
          value?: Json | null
        }
        Update: {
          course_id?: number
          created_at?: string
          id?: number
          linked_file?: string | null
          order?: number | null
          type?: Database["public"]["Enums"]["block_types"]
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "course_blocks_course_id_fkey"
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
          id: number
          organization_id: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: number
          organization_id: string
          title: string
        }
        Update: {
          created_at?: string
          id?: number
          organization_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      domains: {
        Row: {
          created_at: string
          dns_records: Json | null
          domain: string
          id: number
          is_primary: boolean | null
          organization_id: string
          resend_domain_id: string | null
        }
        Insert: {
          created_at?: string
          dns_records?: Json | null
          domain: string
          id?: number
          is_primary?: boolean | null
          organization_id: string
          resend_domain_id?: string | null
        }
        Update: {
          created_at?: string
          dns_records?: Json | null
          domain?: string
          id?: number
          is_primary?: boolean | null
          organization_id?: string
          resend_domain_id?: string | null
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
      email_automation_step_members: {
        Row: {
          automation_id: number
          created_at: string
          id: number
          person_id: number
          step: string
        }
        Insert: {
          automation_id: number
          created_at?: string
          id?: number
          person_id: number
          step: string
        }
        Update: {
          automation_id?: number
          created_at?: string
          id?: number
          person_id?: number
          step?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_automation_step_members_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "email_automations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_automation_step_members_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      email_automations: {
        Row: {
          created_at: string
          description: string | null
          email_details: Json | null
          email_template_id: number | null
          form_id: number | null
          id: number
          is_active: boolean
          list_id: number | null
          name: string
          notify_admin: Json | null
          organization_id: string
          pco_form_id: string | null
          pco_list_id: string | null
          trigger_type: string | null
          wait: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          email_details?: Json | null
          email_template_id?: number | null
          form_id?: number | null
          id?: number
          is_active?: boolean
          list_id?: number | null
          name: string
          notify_admin?: Json | null
          organization_id: string
          pco_form_id?: string | null
          pco_list_id?: string | null
          trigger_type?: string | null
          wait?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          email_details?: Json | null
          email_template_id?: number | null
          form_id?: number | null
          id?: number
          is_active?: boolean
          list_id?: number | null
          name?: string
          notify_admin?: Json | null
          organization_id?: string
          pco_form_id?: string | null
          pco_list_id?: string | null
          trigger_type?: string | null
          wait?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_automations_email_template_id_fkey"
            columns: ["email_template_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_automations_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "pco_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_automations_organization_id_fkey"
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
          email_id: number
          id: number
          linked_file: string | null
          order: number | null
          type: Database["public"]["Enums"]["block_types"]
          value: Json | null
        }
        Insert: {
          created_at?: string
          email_id: number
          id?: number
          linked_file?: string | null
          order?: number | null
          type: Database["public"]["Enums"]["block_types"]
          value?: Json | null
        }
        Update: {
          created_at?: string
          email_id?: number
          id?: number
          linked_file?: string | null
          order?: number | null
          type?: Database["public"]["Enums"]["block_types"]
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_blocks_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
        ]
      }
      email_footers: {
        Row: {
          address: string | null
          bg_color: string | null
          copyright_name: string | null
          created_at: string
          email_id: number | null
          id: number
          links: Json | null
          logo: string | null
          name: string | null
          organization_id: string
          reason: string | null
          secondary_text_color: string | null
          socials_color: string | null
          socials_icon_color: string | null
          socials_style: Database["public"]["Enums"]["social_icons_style"]
          subtitle: string | null
          template_title: string | null
          text_color: string | null
          type: Database["public"]["Enums"]["email_types"]
        }
        Insert: {
          address?: string | null
          bg_color?: string | null
          copyright_name?: string | null
          created_at?: string
          email_id?: number | null
          id?: number
          links?: Json | null
          logo?: string | null
          name?: string | null
          organization_id: string
          reason?: string | null
          secondary_text_color?: string | null
          socials_color?: string | null
          socials_icon_color?: string | null
          socials_style?: Database["public"]["Enums"]["social_icons_style"]
          subtitle?: string | null
          template_title?: string | null
          text_color?: string | null
          type: Database["public"]["Enums"]["email_types"]
        }
        Update: {
          address?: string | null
          bg_color?: string | null
          copyright_name?: string | null
          created_at?: string
          email_id?: number | null
          id?: number
          links?: Json | null
          logo?: string | null
          name?: string | null
          organization_id?: string
          reason?: string | null
          secondary_text_color?: string | null
          socials_color?: string | null
          socials_icon_color?: string | null
          socials_style?: Database["public"]["Enums"]["social_icons_style"]
          subtitle?: string | null
          template_title?: string | null
          text_color?: string | null
          type?: Database["public"]["Enums"]["email_types"]
        }
        Relationships: [
          {
            foreignKeyName: "email_footers_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: true
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_organization_id_fkey"
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
      email_list_category_unsubscribes: {
        Row: {
          created_at: string
          email_address: string
          id: number
          organization_id: string
          pco_list_category: number
          person_id: number | null
          reason: string | null
          unsub_email_id: number | null
        }
        Insert: {
          created_at?: string
          email_address: string
          id?: number
          organization_id: string
          pco_list_category: number
          person_id?: number | null
          reason?: string | null
          unsub_email_id?: number | null
        }
        Update: {
          created_at?: string
          email_address?: string
          id?: number
          organization_id?: string
          pco_list_category?: number
          person_id?: number | null
          reason?: string | null
          unsub_email_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "email_list_category_unsubscribes_pco_list_category_fkey"
            columns: ["pco_list_category"]
            isOneToOne: false
            referencedRelation: "pco_list_categories"
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
            foreignKeyName: "people_email_unsubscribes_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
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
      email_recipients: {
        Row: {
          created_at: string
          email_address: string | null
          email_id: number
          id: number
          people_email_id: number | null
          resend_email_id: string | null
          status: Database["public"]["Enums"]["email_delivery_status"] | null
          unsubscribe_token: string | null
        }
        Insert: {
          created_at?: string
          email_address?: string | null
          email_id: number
          id?: number
          people_email_id?: number | null
          resend_email_id?: string | null
          status?: Database["public"]["Enums"]["email_delivery_status"] | null
          unsubscribe_token?: string | null
        }
        Update: {
          created_at?: string
          email_address?: string | null
          email_id?: number
          id?: number
          people_email_id?: number | null
          resend_email_id?: string | null
          status?: Database["public"]["Enums"]["email_delivery_status"] | null
          unsubscribe_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_recipients_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_recipients_people_email_id_fkey"
            columns: ["people_email_id"]
            isOneToOne: false
            referencedRelation: "people_emails"
            referencedColumns: ["id"]
          },
        ]
      }
      emails: {
        Row: {
          created_at: string
          error_message: string | null
          from_email: string | null
          from_email_domain: number | null
          from_name: string | null
          id: number
          list_id: number | null
          organization_id: string
          reply_to: string | null
          reply_to_domain: number | null
          scheduled_for: string | null
          send_now: boolean
          sent_at: string | null
          status: Database["public"]["Enums"]["email_statuses"]
          style: Json | null
          subject: string | null
          trigger_dev_schduled_id: string | null
          type: Database["public"]["Enums"]["email_types"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          from_email?: string | null
          from_email_domain?: number | null
          from_name?: string | null
          id?: number
          list_id?: number | null
          organization_id: string
          reply_to?: string | null
          reply_to_domain?: number | null
          scheduled_for?: string | null
          send_now?: boolean
          sent_at?: string | null
          status?: Database["public"]["Enums"]["email_statuses"]
          style?: Json | null
          subject?: string | null
          trigger_dev_schduled_id?: string | null
          type?: Database["public"]["Enums"]["email_types"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          from_email?: string | null
          from_email_domain?: number | null
          from_name?: string | null
          id?: number
          list_id?: number | null
          organization_id?: string
          reply_to?: string | null
          reply_to_domain?: number | null
          scheduled_for?: string | null
          send_now?: boolean
          sent_at?: string | null
          status?: Database["public"]["Enums"]["email_statuses"]
          style?: Json | null
          subject?: string | null
          trigger_dev_schduled_id?: string | null
          type?: Database["public"]["Enums"]["email_types"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emails_from_email_domain_fkey"
            columns: ["from_email_domain"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "emails_reply_to_domain_fkey"
            columns: ["reply_to_domain"]
            isOneToOne: false
            referencedRelation: "domains"
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
      link_list_link_clicks: {
        Row: {
          created_at: string
          id: number
          link_id: number | null
          link_list_id: number
          socail_link_id: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          link_id?: number | null
          link_list_id: number
          socail_link_id?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          link_id?: number | null
          link_list_id?: number
          socail_link_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "link_list_link_clicks_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "link_list_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "link_list_link_clicks_link_list_id_fkey"
            columns: ["link_list_id"]
            isOneToOne: false
            referencedRelation: "link_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "link_list_link_clicks_socail_link_id_fkey"
            columns: ["socail_link_id"]
            isOneToOne: false
            referencedRelation: "link_list_socials"
            referencedColumns: ["id"]
          },
        ]
      }
      link_list_links: {
        Row: {
          created_at: string
          id: number
          link_list_id: number
          order: number | null
          text: string | null
          type: string | null
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          link_list_id: number
          order?: number | null
          text?: string | null
          type?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          link_list_id?: number
          order?: number | null
          text?: string | null
          type?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "link_list_links_link_list_id_fkey"
            columns: ["link_list_id"]
            isOneToOne: false
            referencedRelation: "link_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      link_list_socials: {
        Row: {
          created_at: string
          icon: string | null
          id: number
          link_list: number
          order: number | null
          url: string | null
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: number
          link_list: number
          order?: number | null
          url?: string | null
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: number
          link_list?: number
          order?: number | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "link_list_socials_link_list_fkey"
            columns: ["link_list"]
            isOneToOne: false
            referencedRelation: "link_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      link_lists: {
        Row: {
          bg_image: string | null
          created_at: string
          description: string | null
          id: number
          is_public: boolean
          logo_asset: string | null
          name: string | null
          organization_id: string
          primary_button: Json | null
          private_name: string
          style: Json | null
          title: string | null
          url_slug: string
        }
        Insert: {
          bg_image?: string | null
          created_at?: string
          description?: string | null
          id?: number
          is_public?: boolean
          logo_asset?: string | null
          name?: string | null
          organization_id: string
          primary_button?: Json | null
          private_name: string
          style?: Json | null
          title?: string | null
          url_slug: string
        }
        Update: {
          bg_image?: string | null
          created_at?: string
          description?: string | null
          id?: number
          is_public?: boolean
          logo_asset?: string | null
          name?: string | null
          organization_id?: string
          primary_button?: Json | null
          private_name?: string
          style?: Json | null
          title?: string | null
          url_slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "link_lists_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_email_usage: {
        Row: {
          current_period_end: string
          current_period_start: string
          organization_id: string
          send_limit: number
          sends_remaining: number
          sends_used: number
          updated_at: string
        }
        Insert: {
          current_period_end: string
          current_period_start: string
          organization_id: string
          send_limit: number
          sends_remaining: number
          sends_used: number
          updated_at?: string
        }
        Update: {
          current_period_end?: string
          current_period_start?: string
          organization_id?: string
          send_limit?: number
          sends_remaining?: number
          sends_used?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_email_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          expires_at: string
          id: number
          invited_by: string
          invited_email: string
          organization_id: string
          role: string | null
          token_hash: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          expires_at: string
          id?: number
          invited_by: string
          invited_email: string
          organization_id: string
          role?: string | null
          token_hash: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          expires_at?: string
          id?: number
          invited_by?: string
          invited_email?: string
          organization_id?: string
          role?: string | null
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_memberships: {
        Row: {
          created_at: string
          id: number
          organization_id: string
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          organization_id: string
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          organization_id?: string
          role?: string | null
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
          default_email: string | null
          default_email_domain: number | null
          id: string
          name: string
          pco_org_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          default_email?: string | null
          default_email_domain?: number | null
          id?: string
          name: string
          pco_org_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          default_email?: string | null
          default_email_domain?: number | null
          id?: string
          name?: string
          pco_org_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "created_by_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizations_default_email_domain_fkey"
            columns: ["default_email_domain"]
            isOneToOne: false
            referencedRelation: "domains"
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
      pco_list_categories: {
        Row: {
          created_at: string
          description: string | null
          id: number
          is_public: boolean
          organization_id: string
          pco_id: string
          pco_name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          is_public?: boolean
          organization_id: string
          pco_id: string
          pco_name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          is_public?: boolean
          organization_id?: string
          pco_id?: string
          pco_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "pco_list_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
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
          {
            foreignKeyName: "pco_lists_pco_list_category_id_fkey"
            columns: ["pco_list_category_id"]
            isOneToOne: false
            referencedRelation: "pco_list_categories"
            referencedColumns: ["pco_id"]
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
          {
            foreignKeyName: "people_emails_pco_person_id_fkey"
            columns: ["pco_person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["pco_id"]
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
      qr_code_clicks: {
        Row: {
          created_at: string
          id: number
          qr_code_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          qr_code_id: string
        }
        Update: {
          created_at?: string
          id?: number
          qr_code_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_code_clicks_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_codes: {
        Row: {
          created_at: string
          id: string
          linked_asset: string | null
          qr_link_id: number
          style: Json | null
          title: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          linked_asset?: string | null
          qr_link_id: number
          style?: Json | null
          title?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          linked_asset?: string | null
          qr_link_id?: number
          style?: Json | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_codes_qr_link_id_fkey"
            columns: ["qr_link_id"]
            isOneToOne: false
            referencedRelation: "qr_links"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_links: {
        Row: {
          created_at: string
          id: number
          name: string | null
          organization_id: string
          status: string
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
          organization_id: string
          status?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
          organization_id?: string
          status?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_links_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_customers: {
        Row: {
          created_at: string | null
          email: string | null
          stripe_customer_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          stripe_customer_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          stripe_customer_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      stripe_payments: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string | null
          id: number
          organization_id: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          id?: number
          organization_id?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          id?: number
          organization_id?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stripe_payments_stripe_customer_id_fkey"
            columns: ["stripe_customer_id"]
            isOneToOne: false
            referencedRelation: "stripe_customers"
            referencedColumns: ["stripe_customer_id"]
          },
          {
            foreignKeyName: "stripe_payments_stripe_price_id_fkey"
            columns: ["stripe_price_id"]
            isOneToOne: false
            referencedRelation: "stripe_prices"
            referencedColumns: ["stripe_price_id"]
          },
        ]
      }
      stripe_prices: {
        Row: {
          active: boolean | null
          amount: number | null
          created_at: string | null
          currency: string | null
          id: number
          interval: string | null
          interval_count: number | null
          is_test_mode: boolean | null
          metadata: Json | null
          stripe_price_id: string
          stripe_product_id: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          id?: number
          interval?: string | null
          interval_count?: number | null
          is_test_mode?: boolean | null
          metadata?: Json | null
          stripe_price_id: string
          stripe_product_id?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          id?: number
          interval?: string | null
          interval_count?: number | null
          is_test_mode?: boolean | null
          metadata?: Json | null
          stripe_price_id?: string
          stripe_product_id?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_prices_stripe_product_id_fkey"
            columns: ["stripe_product_id"]
            isOneToOne: false
            referencedRelation: "stripe_products"
            referencedColumns: ["stripe_product_id"]
          },
        ]
      }
      stripe_products: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: number
          is_test_mode: boolean | null
          metadata: Json | null
          name: string
          send_limit: number | null
          stripe_product_id: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: number
          is_test_mode?: boolean | null
          metadata?: Json | null
          name: string
          send_limit?: number | null
          stripe_product_id: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: number
          is_test_mode?: boolean | null
          metadata?: Json | null
          name?: string
          send_limit?: number | null
          stripe_product_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      stripe_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: number
          organization_id: string | null
          payment_method_brand: string | null
          payment_method_last4: string | null
          status: string
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: number
          organization_id?: string | null
          payment_method_brand?: string | null
          payment_method_last4?: string | null
          status: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: number
          organization_id?: string | null
          payment_method_brand?: string | null
          payment_method_last4?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stripe_subscriptions_stripe_customer_id_fkey"
            columns: ["stripe_customer_id"]
            isOneToOne: false
            referencedRelation: "stripe_customers"
            referencedColumns: ["stripe_customer_id"]
          },
          {
            foreignKeyName: "stripe_subscriptions_stripe_price_id_fkey"
            columns: ["stripe_price_id"]
            isOneToOne: false
            referencedRelation: "stripe_prices"
            referencedColumns: ["stripe_price_id"]
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
      count_direct_storage_items: {
        Args: {
          bucket_name: string
          folder_path: string
        }
        Returns: number
      }
      delete_old_email_history: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_user_organizations: {
        Args: {
          user_uuid: string
        }
        Returns: string[]
      }
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
        | "list"
        | "author"
        | "quiz"
        | "audio"
      email_address_status: "unsubscribed" | "pco_blocked" | "subscribed"
      email_delivery_status:
        | "sent"
        | "delivered"
        | "delivery_delayed"
        | "complained"
        | "bounced"
        | "opened"
        | "pending"
        | "did-not-send"
      email_statuses: "draft" | "sent" | "sending" | "scheduled" | "failed"
      email_types: "standard" | "template"
      pco_sync_types: "lists" | "emails"
      social_icons_style: "outline" | "filled" | "icon-only"
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
