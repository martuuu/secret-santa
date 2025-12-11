export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          qr_token: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          qr_token?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          qr_token?: string
        }
      }
      groups: {
        Row: {
          id: string
          name: string
          created_at: string
          admin_id: string
          status: 'open' | 'drawn'
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          admin_id: string
          status?: 'open' | 'drawn'
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          admin_id?: string
          status?: 'open' | 'drawn'
        }
      }
      participants: {
        Row: {
          id: string
          group_id: string
          user_id: string
          lives: number
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          lives?: number
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          lives?: number
        }
      }
      matches: {
        Row: {
          id: string
          group_id: string
          santa_id: string
          giftee_id: string
        }
        Insert: {
          id?: string
          group_id: string
          santa_id: string
          giftee_id: string
        }
        Update: {
          id?: string
          group_id?: string
          santa_id?: string
          giftee_id?: string
        }
      }
      wishlist_items: {
        Row: {
          id: string
          user_id: string
          title: string
          url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          url?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      attempt_guess: {
        Args: {
          group_id_input: string
          suspect_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Group = Database['public']['Tables']['groups']['Row']
export type Participant = Database['public']['Tables']['participants']['Row']
export type Match = Database['public']['Tables']['matches']['Row']
export type WishlistItem = Database['public']['Tables']['wishlist_items']['Row']

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type GroupInsert = Database['public']['Tables']['groups']['Insert']
export type ParticipantInsert = Database['public']['Tables']['participants']['Insert']
export type MatchInsert = Database['public']['Tables']['matches']['Insert']
export type WishlistItemInsert = Database['public']['Tables']['wishlist_items']['Insert']

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type GroupUpdate = Database['public']['Tables']['groups']['Update']
export type ParticipantUpdate = Database['public']['Tables']['participants']['Update']
export type MatchUpdate = Database['public']['Tables']['matches']['Update']
export type WishlistItemUpdate = Database['public']['Tables']['wishlist_items']['Update']
