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
      brand_colors: {
        Row: {
          colors: Json
          created_at: string
          id: number
          organization_id: string
        }
        Insert: {
          colors: Json
          created_at?: string
          id?: number
          organization_id: string
        }
        Update: {
          colors?: Json
          created_at?: string
          id?: number
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_colors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
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
          has_clicked_verify: boolean
          id: number
          is_primary: boolean | null
          is_verified: boolean
          organization_id: string
          resend_domain_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          dns_records?: Json | null
          domain: string
          has_clicked_verify?: boolean
          id?: number
          is_primary?: boolean | null
          is_verified?: boolean
          organization_id: string
          resend_domain_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          dns_records?: Json | null
          domain?: string
          has_clicked_verify?: boolean
          id?: number
          is_primary?: boolean | null
          is_verified?: boolean
          organization_id?: string
          resend_domain_id?: string | null
          updated_at?: string | null
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
      email_automation_members: {
        Row: {
          automation_id: number
          created_at: string
          id: number
          last_completed_step_id: number
          person_id: number
          reason: string | null
          status: string
          trigger_dev_id: string | null
          updated_at: string | null
        }
        Insert: {
          automation_id: number
          created_at?: string
          id?: number
          last_completed_step_id: number
          person_id: number
          reason?: string | null
          status?: string
          trigger_dev_id?: string | null
          updated_at?: string | null
        }
        Update: {
          automation_id?: number
          created_at?: string
          id?: number
          last_completed_step_id?: number
          person_id?: number
          reason?: string | null
          status?: string
          trigger_dev_id?: string | null
          updated_at?: string | null
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
            foreignKeyName: "email_automation_step_members_last_completed_step_id_fkey"
            columns: ["last_completed_step_id"]
            isOneToOne: false
            referencedRelation: "email_automation_steps"
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
      email_automation_steps: {
        Row: {
          automation_id: number
          created_at: string
          email_template: number | null
          from_email_domain: number | null
          id: number
          order: number | null
          type: string
          updated_at: string | null
          values: Json | null
        }
        Insert: {
          automation_id: number
          created_at?: string
          email_template?: number | null
          from_email_domain?: number | null
          id?: number
          order?: number | null
          type: string
          updated_at?: string | null
          values?: Json | null
        }
        Update: {
          automation_id?: number
          created_at?: string
          email_template?: number | null
          from_email_domain?: number | null
          id?: number
          order?: number | null
          type?: string
          updated_at?: string | null
          values?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_automation_steps_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "email_automations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_automation_steps_email_template_fkey"
            columns: ["email_template"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_automation_steps_from_email_domain_fkey"
            columns: ["from_email_domain"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
      email_automations: {
        Row: {
          created_at: string
          description: string | null
          email_category_id: number | null
          id: number
          is_active: boolean
          list_id: number | null
          name: string
          organization_id: string
          trigger_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          email_category_id?: number | null
          id?: number
          is_active?: boolean
          list_id?: number | null
          name: string
          organization_id: string
          trigger_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          email_category_id?: number | null
          id?: number
          is_active?: boolean
          list_id?: number | null
          name?: string
          organization_id?: string
          trigger_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_automations_email_category_id_fkey"
            columns: ["email_category_id"]
            isOneToOne: false
            referencedRelation: "email_categories"
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
          order: number | null
          type: Database["public"]["Enums"]["block_types"]
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          created_at?: string
          email_id: number
          id?: number
          order?: number | null
          type: Database["public"]["Enums"]["block_types"]
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          created_at?: string
          email_id?: number
          id?: number
          order?: number | null
          type?: Database["public"]["Enums"]["block_types"]
          updated_at?: string | null
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
      email_categories: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          organization_id?: string
          updated_at?: string | null
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
      email_category_unsubscribes: {
        Row: {
          category_id: number
          created_at: string
          email_address: string
          id: number
          organization_id: string
          person_id: number | null
          unsub_email_automation_step_id: number | null
          unsub_email_id: number | null
          updated_at: string | null
        }
        Insert: {
          category_id: number
          created_at?: string
          email_address: string
          id?: number
          organization_id: string
          person_id?: number | null
          unsub_email_automation_step_id?: number | null
          unsub_email_id?: number | null
          updated_at?: string | null
        }
        Update: {
          category_id?: number
          created_at?: string
          email_address?: string
          id?: number
          organization_id?: string
          person_id?: number | null
          unsub_email_automation_step_id?: number | null
          unsub_email_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_category_unsubscribes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "email_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_category_unsubscribes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_category_unsubscribes_person_id_fkey1"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_category_unsubscribes_unsub_email_automation_step_id_fkey"
            columns: ["unsub_email_automation_step_id"]
            isOneToOne: false
            referencedRelation: "email_automation_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_category_unsubscribes_unsub_email_id_fkey"
            columns: ["unsub_email_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
        ]
      }
      email_footers: {
        Row: {
          bg_color: string | null
          created_at: string
          email_id: number | null
          extra_links: Json | null
          id: number
          links: Json | null
          logo: string | null
          name: string | null
          organization_id: string
          secondary_text_color: string | null
          socials_color: string | null
          socials_icon_color: string | null
          socials_style: Database["public"]["Enums"]["social_icons_style"]
          subtitle: string | null
          text_color: string | null
          type: Database["public"]["Enums"]["email_types"]
          updated_at: string | null
        }
        Insert: {
          bg_color?: string | null
          created_at?: string
          email_id?: number | null
          extra_links?: Json | null
          id?: number
          links?: Json | null
          logo?: string | null
          name?: string | null
          organization_id: string
          secondary_text_color?: string | null
          socials_color?: string | null
          socials_icon_color?: string | null
          socials_style?: Database["public"]["Enums"]["social_icons_style"]
          subtitle?: string | null
          text_color?: string | null
          type: Database["public"]["Enums"]["email_types"]
          updated_at?: string | null
        }
        Update: {
          bg_color?: string | null
          created_at?: string
          email_id?: number | null
          extra_links?: Json | null
          id?: number
          links?: Json | null
          logo?: string | null
          name?: string | null
          organization_id?: string
          secondary_text_color?: string | null
          socials_color?: string | null
          socials_icon_color?: string | null
          socials_style?: Database["public"]["Enums"]["social_icons_style"]
          subtitle?: string | null
          text_color?: string | null
          type?: Database["public"]["Enums"]["email_types"]
          updated_at?: string | null
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
      email_link_click_stats: {
        Row: {
          email_id: number
          link_url: string
          total_clicks: number
          updated_at: string | null
        }
        Insert: {
          email_id: number
          link_url: string
          total_clicks?: number
          updated_at?: string | null
        }
        Update: {
          email_id?: number
          link_url?: string
          total_clicks?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_link_click_stats_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
        ]
      }
      email_link_clicks: {
        Row: {
          created_at: string
          email_id: number
          id: number
          link_clicked: string
          resend_email_id: string
        }
        Insert: {
          created_at?: string
          email_id: number
          id?: number
          link_clicked: string
          resend_email_id: string
        }
        Update: {
          created_at?: string
          email_id?: number
          id?: number
          link_clicked?: string
          resend_email_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_link_clicks_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
        ]
      }
      email_metrics: {
        Row: {
          email_id: number
          total_bounces: number
          total_clicks: number
          total_complaints: number
          total_opens: number
          total_sent: number
          total_unsubscribes: number
          updated_at: string | null
        }
        Insert: {
          email_id: number
          total_bounces?: number
          total_clicks?: number
          total_complaints?: number
          total_opens?: number
          total_sent?: number
          total_unsubscribes?: number
          updated_at?: string | null
        }
        Update: {
          email_id?: number
          total_bounces?: number
          total_clicks?: number
          total_complaints?: number
          total_opens?: number
          total_sent?: number
          total_unsubscribes?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_metrics_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: true
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
        ]
      }
      email_org_default_footer_values: {
        Row: {
          created_at: string
          extra_links: Json | null
          id: number
          links: Json | null
          logo: string | null
          name: string | null
          organization_id: string
          socials_color: string | null
          socials_icon_color: string | null
          socials_style: Database["public"]["Enums"]["social_icons_style"]
          subtitle: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          extra_links?: Json | null
          id?: number
          links?: Json | null
          logo?: string | null
          name?: string | null
          organization_id: string
          socials_color?: string | null
          socials_icon_color?: string | null
          socials_style?: Database["public"]["Enums"]["social_icons_style"]
          subtitle?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          extra_links?: Json | null
          id?: number
          links?: Json | null
          logo?: string | null
          name?: string | null
          organization_id?: string
          socials_color?: string | null
          socials_icon_color?: string | null
          socials_style?: Database["public"]["Enums"]["social_icons_style"]
          subtitle?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_org_footer_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_recipients: {
        Row: {
          automation_id: number | null
          created_at: string
          email_address: string | null
          email_id: number | null
          id: number
          people_email_id: number | null
          resend_email_id: string | null
          status: Database["public"]["Enums"]["email_delivery_status"] | null
          updated_at: string | null
        }
        Insert: {
          automation_id?: number | null
          created_at?: string
          email_address?: string | null
          email_id?: number | null
          id?: number
          people_email_id?: number | null
          resend_email_id?: string | null
          status?: Database["public"]["Enums"]["email_delivery_status"] | null
          updated_at?: string | null
        }
        Update: {
          automation_id?: number | null
          created_at?: string
          email_address?: string | null
          email_id?: number | null
          id?: number
          people_email_id?: number | null
          resend_email_id?: string | null
          status?: Database["public"]["Enums"]["email_delivery_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_recipients_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "email_automations"
            referencedColumns: ["id"]
          },
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
      email_unsubscribes: {
        Row: {
          automation_step_id: number | null
          category_id: number | null
          created_at: string
          email_id: number | null
          id: number
          person_email_id: number | null
        }
        Insert: {
          automation_step_id?: number | null
          category_id?: number | null
          created_at?: string
          email_id?: number | null
          id?: number
          person_email_id?: number | null
        }
        Update: {
          automation_step_id?: number | null
          category_id?: number | null
          created_at?: string
          email_id?: number | null
          id?: number
          person_email_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "email_unsubscribes_automation_step_id_fkey"
            columns: ["automation_step_id"]
            isOneToOne: false
            referencedRelation: "email_automation_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_unsubscribes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "email_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_unsubscribes_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_unsubscribes_person_email_id_fkey"
            columns: ["person_email_id"]
            isOneToOne: false
            referencedRelation: "people_emails"
            referencedColumns: ["id"]
          },
        ]
      }
      emails: {
        Row: {
          created_at: string
          email_category: number | null
          error_message: string | null
          from_email: string | null
          from_email_domain: number | null
          from_name: string | null
          id: number
          list_id: number | null
          organization_id: string
          preview_text: string | null
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
          email_category?: number | null
          error_message?: string | null
          from_email?: string | null
          from_email_domain?: number | null
          from_name?: string | null
          id?: number
          list_id?: number | null
          organization_id: string
          preview_text?: string | null
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
          email_category?: number | null
          error_message?: string | null
          from_email?: string | null
          from_email_domain?: number | null
          from_name?: string | null
          id?: number
          list_id?: number | null
          organization_id?: string
          preview_text?: string | null
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
            foreignKeyName: "emails_email_category_fkey"
            columns: ["email_category"]
            isOneToOne: false
            referencedRelation: "email_categories"
            referencedColumns: ["id"]
          },
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
          expires: string | null
          id: number
          invited_by: string | null
          organization_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires?: string | null
          id?: number
          invited_by?: string | null
          organization_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires?: string | null
          id?: number
          invited_by?: string | null
          organization_id?: string | null
          status?: string | null
          updated_at?: string | null
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
      link_list_links: {
        Row: {
          created_at: string
          id: number
          link_list_id: number
          order: number | null
          text: string | null
          type: string | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          link_list_id: number
          order?: number | null
          text?: string | null
          type?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          link_list_id?: number
          order?: number | null
          text?: string | null
          type?: string | null
          updated_at?: string | null
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
          updated_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: number
          link_list: number
          order?: number | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: number
          link_list?: number
          order?: number | null
          updated_at?: string | null
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
          updated_at: string | null
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
          updated_at?: string | null
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
          updated_at?: string | null
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
      organization_memberships: {
        Row: {
          created_at: string
          id: number
          organization_id: string
          role: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          organization_id: string
          role?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          organization_id?: string
          role?: string | null
          updated_at?: string | null
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
          address: Json | null
          created_at: string
          created_by: string | null
          default_email: string | null
          default_email_domain: number | null
          finished_onboarding: boolean
          id: string
          name: string
          pco_org_id: string | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          created_at?: string
          created_by?: string | null
          default_email?: string | null
          default_email_domain?: number | null
          finished_onboarding?: boolean
          id?: string
          name: string
          pco_org_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          created_at?: string
          created_by?: string | null
          default_email?: string | null
          default_email_domain?: number | null
          finished_onboarding?: boolean
          id?: string
          name?: string
          pco_org_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "created_by_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: true
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
          organization_id: string
          pco_id: string
          pco_name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          organization_id: string
          pco_id: string
          pco_name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
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
      pending_automation_runs: {
        Row: {
          automation_id: number
          created_at: string | null
          id: number
          organization_id: string
          person_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          automation_id: number
          created_at?: string | null
          id?: number
          organization_id: string
          person_id: string
          status: string
          updated_at?: string | null
        }
        Update: {
          automation_id?: number
          created_at?: string | null
          id?: number
          organization_id?: string
          person_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pending_automation_runs_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "email_automations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_automation_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_automation_runs_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["pco_id"]
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
          search_vector: unknown | null
          updated_at: string | null
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
          search_vector?: unknown | null
          updated_at?: string | null
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
          search_vector?: unknown | null
          updated_at?: string | null
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
      people_email_statuses: {
        Row: {
          created_at: string
          email_address: string
          id: number
          organization_id: string
          protected_from_cleaning: boolean | null
          reason: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          email_address: string
          id?: number
          organization_id: string
          protected_from_cleaning?: boolean | null
          reason?: string | null
          status: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          email_address?: string
          id?: number
          organization_id?: string
          protected_from_cleaning?: boolean | null
          reason?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "imported_unsubscribes_organization_id_fkey"
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
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          organization_id: string
          pco_email_id: string
          pco_person_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          organization_id?: string
          pco_email_id?: string
          pco_person_id?: string
          updated_at?: string | null
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
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          linked_asset?: string | null
          qr_link_id: number
          style?: Json | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          linked_asset?: string | null
          qr_link_id?: number
          style?: Json | null
          title?: string | null
          updated_at?: string | null
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
          updated_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
          organization_id: string
          status?: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
          organization_id?: string
          status?: string
          updated_at?: string | null
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
          organization_id: string | null
          stripe_customer_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          organization_id?: string | null
          stripe_customer_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          organization_id?: string | null
          stripe_customer_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stripe_customers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          preferences: Json | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          preferences?: Json | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          preferences?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _count_unsub_csvs: {
        Args: { org_uuid: string }
        Returns: number
      }
      _is_org_member_no_rls: {
        Args: { target_org: string }
        Returns: boolean
      }
      _is_org_owner_no_rls: {
        Args: { target_org: string }
        Returns: boolean
      }
      _is_recent_org_creator: {
        Args: { org_id: string }
        Returns: boolean
      }
      add_user_to_organization: {
        Args: {
          target_org_id: string
          target_user_id: string
          target_email: string
          target_role: string
        }
        Returns: undefined
      }
      block_editable: {
        Args: { email_block_email_id: number }
        Returns: boolean
      }
      block_visible: {
        Args: { email_block_email_id: number }
        Returns: boolean
      }
      clean_complained_emails: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_unsubscribe_csvs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      count_direct_storage_items: {
        Args: { bucket_name: string; folder_path: string }
        Returns: number
      }
      debug_email_recipients: {
        Args: { email_id_input: number }
        Returns: {
          people_email_id: number
          email: string
          first_name: string
          last_name: string
          reason: string
        }[]
      }
      delete_done_pending_automation_runs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_unverified_domains: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      extract_org_id: {
        Args: { path: string }
        Returns: string
      }
      footer_editable: {
        Args: {
          _email_id: number
          _footer_type: Database["public"]["Enums"]["email_types"]
          _org: string
        }
        Returns: boolean
      }
      get_email_recipients_details: {
        Args: {
          email_id_input: number
          email_search?: string
          recipient_status?: Database["public"]["Enums"]["email_delivery_status"]
          start_index?: number
          end_index?: number
        }
        Returns: {
          id: number
          email_address: string
          status: Database["public"]["Enums"]["email_delivery_status"]
          created_at: string
          updated_at: string
          first_name: string
          last_name: string
          unsubscribed: boolean
          clicked: boolean
        }[]
      }
      get_public_list_categories_with_unsub_status: {
        Args: { input_people_email_id: number }
        Returns: {
          category_id: number
          pco_name: string
          description: string
          is_unsubscribed: boolean
        }[]
      }
      get_user_organizations: {
        Args: { user_uuid: string }
        Returns: string[]
      }
      is_org_member: {
        Args: { org: string }
        Returns: boolean
      }
      is_org_owner: {
        Args: { org: string }
        Returns: boolean
      }
      is_owner_self: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      org_storage_used_mb: {
        Args: { org_id: string }
        Returns: number
      }
      re_subscribe_and_cleanup: {
        Args: {
          person_email_id_input: number
          email_id_input?: number
          automation_step_id_input?: number
        }
        Returns: undefined
      }
      resubscribe_category: {
        Args: {
          person_email_id_input: number
          category_id_input: number
          email_id_input?: number
          automation_step_id_input?: number
        }
        Returns: undefined
      }
      shares_org_with_current_user: {
        Args: { target_user: string }
        Returns: boolean
      }
      unsubscribe_from_all_emails: {
        Args: {
          person_email_id_input: number
          email_id_input?: number
          automation_step_id_input?: number
        }
        Returns: undefined
      }
      unsubscribe_from_email_category: {
        Args: {
          person_email_id_input: number
          category_id_input: number
          email_id_input?: number
          automation_step_id_input?: number
        }
        Returns: undefined
      }
      update_hourly_link_click_stats: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_recent_email_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
      email_address_status:
        | "unsubscribed"
        | "pco_blocked"
        | "subscribed"
        | "cleaned"
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
      automation_conditions: ["added_to_list", "removed_from_list"],
      block_types: [
        "cards",
        "button",
        "text",
        "divider",
        "video",
        "file-download",
        "image",
        "spacer",
        "list",
        "author",
        "quiz",
        "audio",
      ],
      email_address_status: [
        "unsubscribed",
        "pco_blocked",
        "subscribed",
        "cleaned",
      ],
      email_delivery_status: [
        "sent",
        "delivered",
        "delivery_delayed",
        "complained",
        "bounced",
        "opened",
        "pending",
        "did-not-send",
      ],
      email_statuses: ["draft", "sent", "sending", "scheduled", "failed"],
      email_types: ["standard", "template"],
      pco_sync_types: ["lists", "emails"],
      social_icons_style: ["outline", "filled", "icon-only"],
    },
  },
} as const
