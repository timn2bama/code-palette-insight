export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          access_restrictions: Json | null
          api_key: string
          category: string | null
          created_at: string
          description: string | null
          encrypted_key: string | null
          encryption_version: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string | null
          last_rotated: string | null
          last_used: string | null
          name: string
          next_rotation_due: string | null
          rotation_interval: number | null
          security_level: string | null
          service: string
          updated_at: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          access_restrictions?: Json | null
          api_key: string
          category?: string | null
          created_at?: string
          description?: string | null
          encrypted_key?: string | null
          encryption_version?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string | null
          last_rotated?: string | null
          last_used?: string | null
          name: string
          next_rotation_due?: string | null
          rotation_interval?: number | null
          security_level?: string | null
          service: string
          updated_at?: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          access_restrictions?: Json | null
          api_key?: string
          category?: string | null
          created_at?: string
          description?: string | null
          encrypted_key?: string | null
          encryption_version?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string | null
          last_rotated?: string | null
          last_used?: string | null
          name?: string
          next_rotation_due?: string | null
          rotation_interval?: number | null
          security_level?: string | null
          service?: string
          updated_at?: string
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          api_key_id: string | null
          details: Json | null
          error_message: string | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          success: boolean
          timestamp: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          api_key_id?: string | null
          details?: Json | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          success?: boolean
          timestamp?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          api_key_id?: string | null
          details?: Json | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          success?: boolean
          timestamp?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          published: boolean
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      carbon_footprint_items: {
        Row: {
          created_at: string
          disposal_impact: number | null
          id: string
          last_calculated: string
          manufacturing_impact: number | null
          total_footprint: number | null
          transportation_impact: number | null
          updated_at: string
          usage_impact: number | null
          user_id: string
          wardrobe_item_id: string
        }
        Insert: {
          created_at?: string
          disposal_impact?: number | null
          id?: string
          last_calculated?: string
          manufacturing_impact?: number | null
          total_footprint?: number | null
          transportation_impact?: number | null
          updated_at?: string
          usage_impact?: number | null
          user_id: string
          wardrobe_item_id: string
        }
        Update: {
          created_at?: string
          disposal_impact?: number | null
          id?: string
          last_calculated?: string
          manufacturing_impact?: number | null
          total_footprint?: number | null
          transportation_impact?: number | null
          updated_at?: string
          usage_impact?: number | null
          user_id?: string
          wardrobe_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carbon_footprint_items_wardrobe_item_id_fkey"
            columns: ["wardrobe_item_id"]
            isOneToOne: false
            referencedRelation: "wardrobe_items"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_entries: {
        Row: {
          caption: string | null
          challenge_id: string
          created_at: string
          id: string
          outfit_id: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          challenge_id: string
          created_at?: string
          id?: string
          outfit_id: string
          user_id: string
        }
        Update: {
          caption?: string | null
          challenge_id?: string
          created_at?: string
          id?: string
          outfit_id?: string
          user_id?: string
        }
        Relationships: []
      }
      challenge_votes: {
        Row: {
          challenge_id: string
          created_at: string
          entry_id: string
          id: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          entry_id: string
          id?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          entry_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          end_at: string
          id: string
          is_public: boolean
          start_at: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          end_at: string
          id?: string
          is_public?: boolean
          start_at: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          end_at?: string
          id?: string
          is_public?: boolean
          start_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_outfit_suggestions: {
        Row: {
          ai_reasoning: string | null
          created_at: string
          id: string
          occasion: string | null
          outfit_data: Json
          style_preference: string | null
          suggestion_date: string
          updated_at: string
          user_feedback: string | null
          user_id: string
          was_worn: boolean | null
          weather_context: Json | null
        }
        Insert: {
          ai_reasoning?: string | null
          created_at?: string
          id?: string
          occasion?: string | null
          outfit_data: Json
          style_preference?: string | null
          suggestion_date: string
          updated_at?: string
          user_feedback?: string | null
          user_id: string
          was_worn?: boolean | null
          weather_context?: Json | null
        }
        Update: {
          ai_reasoning?: string | null
          created_at?: string
          id?: string
          occasion?: string | null
          outfit_data?: Json
          style_preference?: string | null
          suggestion_date?: string
          updated_at?: string
          user_feedback?: string | null
          user_id?: string
          was_worn?: boolean | null
          weather_context?: Json | null
        }
        Relationships: []
      }
      event_outfit_requests: {
        Row: {
          created_at: string
          dress_code: string | null
          event_date: string
          event_title: string
          event_type: string
          id: string
          location: string | null
          selected_outfit_id: string | null
          special_requirements: string | null
          status: string
          suggested_outfits: Json | null
          updated_at: string
          user_id: string
          weather_requirements: string | null
        }
        Insert: {
          created_at?: string
          dress_code?: string | null
          event_date: string
          event_title: string
          event_type: string
          id?: string
          location?: string | null
          selected_outfit_id?: string | null
          special_requirements?: string | null
          status?: string
          suggested_outfits?: Json | null
          updated_at?: string
          user_id: string
          weather_requirements?: string | null
        }
        Update: {
          created_at?: string
          dress_code?: string | null
          event_date?: string
          event_title?: string
          event_type?: string
          id?: string
          location?: string | null
          selected_outfit_id?: string | null
          special_requirements?: string | null
          status?: string
          suggested_outfits?: Json | null
          updated_at?: string
          user_id?: string
          weather_requirements?: string | null
        }
        Relationships: []
      }
      external_shopping_links: {
        Row: {
          available: boolean | null
          created_at: string | null
          id: string
          last_checked: string | null
          platform: string
          price: number | null
          product_url: string
          wardrobe_item_id: string | null
        }
        Insert: {
          available?: boolean | null
          created_at?: string | null
          id?: string
          last_checked?: string | null
          platform: string
          price?: number | null
          product_url: string
          wardrobe_item_id?: string | null
        }
        Update: {
          available?: boolean | null
          created_at?: string | null
          id?: string
          last_checked?: string | null
          platform?: string
          price?: number | null
          product_url?: string
          wardrobe_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "external_shopping_links_wardrobe_item_id_fkey"
            columns: ["wardrobe_item_id"]
            isOneToOne: false
            referencedRelation: "wardrobe_items"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_pages: {
        Row: {
          content: Json
          created_at: string
          funnel_id: string
          id: string
          is_home: boolean
          path: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          funnel_id: string
          id?: string
          is_home?: boolean
          path: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          funnel_id?: string
          id?: string
          is_home?: boolean
          path?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "funnel_pages_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "funnels"
            referencedColumns: ["id"]
          },
        ]
      }
      funnels: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          settings: Json
          slug: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          settings?: Json
          slug: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          settings?: Json
          slug?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      integration_settings: {
        Row: {
          created_at: string | null
          id: string
          integration_type: string
          is_active: boolean | null
          settings: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          integration_type: string
          is_active?: boolean | null
          settings?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          integration_type?: string
          is_active?: boolean | null
          settings?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      key_rotations: {
        Row: {
          api_key_id: string
          id: string
          next_rotation_due: string | null
          old_key_hash: string | null
          rotated_at: string
          rotated_by: string
          rotation_reason: string
        }
        Insert: {
          api_key_id: string
          id?: string
          next_rotation_due?: string | null
          old_key_hash?: string | null
          rotated_at?: string
          rotated_by: string
          rotation_reason: string
        }
        Update: {
          api_key_id?: string
          id?: string
          next_rotation_due?: string | null
          old_key_hash?: string | null
          rotated_at?: string
          rotated_by?: string
          rotation_reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "key_rotations_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_items: {
        Row: {
          brand: string | null
          buyer_id: string | null
          category: string
          condition: string
          created_at: string
          description: string | null
          id: string
          is_available: boolean | null
          photos: Json | null
          price: number
          seller_id: string
          shipping_included: boolean | null
          size: string | null
          sold_at: string | null
          sustainability_score: number | null
          tags: string[] | null
          title: string
          updated_at: string
          wardrobe_item_id: string | null
        }
        Insert: {
          brand?: string | null
          buyer_id?: string | null
          category: string
          condition: string
          created_at?: string
          description?: string | null
          id?: string
          is_available?: boolean | null
          photos?: Json | null
          price: number
          seller_id: string
          shipping_included?: boolean | null
          size?: string | null
          sold_at?: string | null
          sustainability_score?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
          wardrobe_item_id?: string | null
        }
        Update: {
          brand?: string | null
          buyer_id?: string | null
          category?: string
          condition?: string
          created_at?: string
          description?: string | null
          id?: string
          is_available?: boolean | null
          photos?: Json | null
          price?: number
          seller_id?: string
          shipping_included?: boolean | null
          size?: string | null
          sold_at?: string | null
          sustainability_score?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          wardrobe_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_items_wardrobe_item_id_fkey"
            columns: ["wardrobe_item_id"]
            isOneToOne: false
            referencedRelation: "wardrobe_items"
            referencedColumns: ["id"]
          },
        ]
      }
      outfit_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          outfit_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          outfit_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          outfit_id?: string
          user_id?: string
        }
        Relationships: []
      }
      outfit_items: {
        Row: {
          created_at: string
          id: string
          outfit_id: string
          wardrobe_item_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          outfit_id: string
          wardrobe_item_id: string
        }
        Update: {
          created_at?: string
          id?: string
          outfit_id?: string
          wardrobe_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "outfit_items_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outfit_items_wardrobe_item_id_fkey"
            columns: ["wardrobe_item_id"]
            isOneToOne: false
            referencedRelation: "wardrobe_items"
            referencedColumns: ["id"]
          },
        ]
      }
      outfit_likes: {
        Row: {
          created_at: string
          outfit_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          outfit_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          outfit_id?: string
          user_id?: string
        }
        Relationships: []
      }
      outfit_ratings: {
        Row: {
          created_at: string
          outfit_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          outfit_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          outfit_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      outfits: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          occasion: string | null
          season: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          occasion?: string | null
          season?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          occasion?: string | null
          season?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      personal_shopping_requests: {
        Row: {
          brand_preferences: string[] | null
          budget_max: number | null
          budget_min: number | null
          color_preferences: string[] | null
          created_at: string
          fulfillment_notes: string | null
          id: string
          priority_categories: string[] | null
          recommendations: Json | null
          request_type: string
          size_requirements: Json | null
          status: string
          style_preferences: string | null
          sustainability_requirements: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_preferences?: string[] | null
          budget_max?: number | null
          budget_min?: number | null
          color_preferences?: string[] | null
          created_at?: string
          fulfillment_notes?: string | null
          id?: string
          priority_categories?: string[] | null
          recommendations?: Json | null
          request_type: string
          size_requirements?: Json | null
          status?: string
          style_preferences?: string | null
          sustainability_requirements?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_preferences?: string[] | null
          budget_max?: number | null
          budget_min?: number | null
          color_preferences?: string[] | null
          created_at?: string
          fulfillment_notes?: string | null
          id?: string
          priority_categories?: string[] | null
          recommendations?: Json | null
          request_type?: string
          size_requirements?: Json | null
          status?: string
          style_preferences?: string | null
          sustainability_requirements?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rental_bookings: {
        Row: {
          created_at: string
          deposit_paid: number
          end_date: string
          id: string
          rental_item_id: string
          renter_id: string
          return_condition: string | null
          review_comment: string | null
          review_rating: number | null
          special_instructions: string | null
          start_date: string
          status: string
          total_cost: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          deposit_paid: number
          end_date: string
          id?: string
          rental_item_id: string
          renter_id: string
          return_condition?: string | null
          review_comment?: string | null
          review_rating?: number | null
          special_instructions?: string | null
          start_date: string
          status?: string
          total_cost: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          deposit_paid?: number
          end_date?: string
          id?: string
          rental_item_id?: string
          renter_id?: string
          return_condition?: string | null
          review_comment?: string | null
          review_rating?: number | null
          special_instructions?: string | null
          start_date?: string
          status?: string
          total_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_bookings_rental_item_id_fkey"
            columns: ["rental_item_id"]
            isOneToOne: false
            referencedRelation: "rental_items"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_items: {
        Row: {
          brand: string | null
          care_instructions: string | null
          category: string
          created_at: string
          daily_rate: number
          deposit_amount: number
          description: string | null
          id: string
          is_available: boolean | null
          owner_id: string
          photos: Json | null
          rental_terms: string | null
          size: string | null
          title: string
          updated_at: string
          wardrobe_item_id: string | null
          weekly_rate: number | null
        }
        Insert: {
          brand?: string | null
          care_instructions?: string | null
          category: string
          created_at?: string
          daily_rate: number
          deposit_amount: number
          description?: string | null
          id?: string
          is_available?: boolean | null
          owner_id: string
          photos?: Json | null
          rental_terms?: string | null
          size?: string | null
          title: string
          updated_at?: string
          wardrobe_item_id?: string | null
          weekly_rate?: number | null
        }
        Update: {
          brand?: string | null
          care_instructions?: string | null
          category?: string
          created_at?: string
          daily_rate?: number
          deposit_amount?: number
          description?: string | null
          id?: string
          is_available?: boolean | null
          owner_id?: string
          photos?: Json | null
          rental_terms?: string | null
          size?: string | null
          title?: string
          updated_at?: string
          wardrobe_item_id?: string | null
          weekly_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rental_items_wardrobe_item_id_fkey"
            columns: ["wardrobe_item_id"]
            isOneToOne: false
            referencedRelation: "wardrobe_items"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_services: {
        Row: {
          created_at: string
          id: string
          service_address: string
          service_data: Json
          service_name: string
          service_phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          service_address: string
          service_data: Json
          service_name: string
          service_phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          service_address?: string
          service_data?: Json
          service_name?: string
          service_phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_tweets: {
        Row: {
          created_at: string
          id: string
          recurrence: Database["public"]["Enums"]["recurrence_frequency"]
          scheduled_at: string | null
          task_title: string
          tweet_text: string
          tweet_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          recurrence?: Database["public"]["Enums"]["recurrence_frequency"]
          scheduled_at?: string | null
          task_title: string
          tweet_text: string
          tweet_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          recurrence?: Database["public"]["Enums"]["recurrence_frequency"]
          scheduled_at?: string | null
          task_title?: string
          tweet_text?: string
          tweet_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      seasonal_analytics: {
        Row: {
          category: string
          created_at: string | null
          id: string
          season: string
          top_items: Json | null
          updated_at: string | null
          usage_count: number | null
          user_id: string
          year: number
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          season: string
          top_items?: Json | null
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
          year: number
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          season?: string
          top_items?: Json | null
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      security_settings: {
        Row: {
          created_at: string
          id: string
          setting_name: string
          setting_value: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_name: string
          setting_value: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_name?: string
          setting_value?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shared_api_keys: {
        Row: {
          api_key_id: string
          id: string
          permissions: string
          shared_at: string
          shared_by: string
          team_id: string
        }
        Insert: {
          api_key_id: string
          id?: string
          permissions?: string
          shared_at?: string
          shared_by: string
          team_id: string
        }
        Update: {
          api_key_id?: string
          id?: string
          permissions?: string
          shared_at?: string
          shared_by?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_api_keys_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_api_keys_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_recommendations: {
        Row: {
          category: string
          created_at: string | null
          external_links: Json | null
          id: string
          is_active: boolean | null
          priority: number | null
          reason: string | null
          recommendation_type: string
          suggested_items: Json | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          external_links?: Json | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          reason?: string | null
          recommendation_type: string
          suggested_items?: Json | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          external_links?: Json | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          reason?: string | null
          recommendation_type?: string
          suggested_items?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      style_evolution_tracking: {
        Row: {
          achievements: string[] | null
          confidence_level: number | null
          created_at: string
          id: string
          insights: Json | null
          mood_tags: string[] | null
          style_goals: string[] | null
          style_metrics: Json
          tracking_date: string
          user_id: string
        }
        Insert: {
          achievements?: string[] | null
          confidence_level?: number | null
          created_at?: string
          id?: string
          insights?: Json | null
          mood_tags?: string[] | null
          style_goals?: string[] | null
          style_metrics: Json
          tracking_date: string
          user_id: string
        }
        Update: {
          achievements?: string[] | null
          confidence_level?: number | null
          created_at?: string
          id?: string
          insights?: Json | null
          mood_tags?: string[] | null
          style_goals?: string[] | null
          style_metrics?: Json
          tracking_date?: string
          user_id?: string
        }
        Relationships: []
      }
      stylist_consultations: {
        Row: {
          consultation_type: string
          created_at: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          price: number | null
          scheduled_date: string | null
          status: string | null
          stylist_feedback: Json | null
          user_id: string
        }
        Insert: {
          consultation_type: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          price?: number | null
          scheduled_date?: string | null
          status?: string | null
          stylist_feedback?: Json | null
          user_id: string
        }
        Update: {
          consultation_type?: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          price?: number | null
          scheduled_date?: string | null
          status?: string | null
          stylist_feedback?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_tiers: {
        Row: {
          created_at: string | null
          features: Json
          id: string
          is_active: boolean | null
          limits: Json
          price_monthly: number | null
          price_yearly: number | null
          tier_name: string
        }
        Insert: {
          created_at?: string | null
          features?: Json
          id?: string
          is_active?: boolean | null
          limits?: Json
          price_monthly?: number | null
          price_yearly?: number | null
          tier_name: string
        }
        Update: {
          created_at?: string | null
          features?: Json
          id?: string
          is_active?: boolean | null
          limits?: Json
          price_monthly?: number | null
          price_yearly?: number | null
          tier_name?: string
        }
        Relationships: []
      }
      sustainability_metrics: {
        Row: {
          calculated_at: string
          id: string
          metric_type: string
          notes: string | null
          period_end: string
          period_start: string
          source_data: Json | null
          unit: string
          user_id: string
          value: number
        }
        Insert: {
          calculated_at?: string
          id?: string
          metric_type: string
          notes?: string | null
          period_end: string
          period_start: string
          source_data?: Json | null
          unit: string
          user_id: string
          value: number
        }
        Update: {
          calculated_at?: string
          id?: string
          metric_type?: string
          notes?: string | null
          period_end?: string
          period_start?: string
          source_data?: Json | null
          unit?: string
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: string
          invited_by: string
          joined_at: string
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          invited_by: string
          joined_at?: string
          role?: string
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          invited_by?: string
          joined_at?: string
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_permissions: {
        Row: {
          created_at: string
          id: string
          permission_name: string
          permission_value: boolean
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission_name: string
          permission_value?: boolean
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          permission_name?: string
          permission_value?: boolean
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_permissions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      usage_tracking: {
        Row: {
          billing_period_end: string
          billing_period_start: string
          created_at: string | null
          id: string
          usage_count: number | null
          usage_type: string
          user_id: string
        }
        Insert: {
          billing_period_end: string
          billing_period_start: string
          created_at?: string | null
          id?: string
          usage_count?: number | null
          usage_type: string
          user_id: string
        }
        Update: {
          billing_period_end?: string
          billing_period_start?: string
          created_at?: string | null
          id?: string
          usage_count?: number | null
          usage_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_style_preferences: {
        Row: {
          created_at: string
          disliked_colors: string[] | null
          favorite_colors: string[] | null
          preferences: Json
          style_keywords: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          disliked_colors?: string[] | null
          favorite_colors?: string[] | null
          preferences?: Json
          style_keywords?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          disliked_colors?: string[] | null
          favorite_colors?: string[] | null
          preferences?: Json
          style_keywords?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wardrobe_analytics: {
        Row: {
          cost_per_wear: number | null
          created_at: string | null
          id: string
          last_calculated: string | null
          total_cost: number | null
          updated_at: string | null
          user_id: string
          wardrobe_item_id: string
          wear_count: number | null
        }
        Insert: {
          cost_per_wear?: number | null
          created_at?: string | null
          id?: string
          last_calculated?: string | null
          total_cost?: number | null
          updated_at?: string | null
          user_id: string
          wardrobe_item_id: string
          wear_count?: number | null
        }
        Update: {
          cost_per_wear?: number | null
          created_at?: string | null
          id?: string
          last_calculated?: string | null
          total_cost?: number | null
          updated_at?: string | null
          user_id?: string
          wardrobe_item_id?: string
          wear_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wardrobe_analytics_wardrobe_item_id_fkey"
            columns: ["wardrobe_item_id"]
            isOneToOne: false
            referencedRelation: "wardrobe_items"
            referencedColumns: ["id"]
          },
        ]
      }
      wardrobe_items: {
        Row: {
          brand: string | null
          category: string
          color: string | null
          color_palette: Json | null
          created_at: string
          detected_labels: Json | null
          dominant_color: string | null
          id: string
          last_worn: string | null
          name: string
          photo_url: string | null
          purchase_date: string | null
          updated_at: string
          user_id: string
          wear_count: number | null
        }
        Insert: {
          brand?: string | null
          category: string
          color?: string | null
          color_palette?: Json | null
          created_at?: string
          detected_labels?: Json | null
          dominant_color?: string | null
          id?: string
          last_worn?: string | null
          name: string
          photo_url?: string | null
          purchase_date?: string | null
          updated_at?: string
          user_id: string
          wear_count?: number | null
        }
        Update: {
          brand?: string | null
          category?: string
          color?: string | null
          color_palette?: Json | null
          created_at?: string
          detected_labels?: Json | null
          dominant_color?: string | null
          id?: string
          last_worn?: string | null
          name?: string
          photo_url?: string | null
          purchase_date?: string | null
          updated_at?: string
          user_id?: string
          wear_count?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      public_blog_posts: {
        Row: {
          author_name: string | null
          content: string | null
          created_at: string | null
          excerpt: string | null
          featured_image_url: string | null
          id: string | null
          published: boolean | null
          published_at: string | null
          slug: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_cost_per_wear: {
        Args: { item_id: string }
        Returns: number
      }
      is_member: {
        Args: { _team_id: string }
        Returns: boolean
      }
      is_team_admin: {
        Args: { _team_id: string }
        Returns: boolean
      }
    }
    Enums: {
      recurrence_frequency: "none" | "daily" | "weekly" | "monthly"
    }
    CompositeTypes: {
      [_ in never]: never
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
  public: {
    Enums: {
      recurrence_frequency: ["none", "daily", "weekly", "monthly"],
    },
  },
} as const
