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
      genres: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
        Relationships: []
      }
      loops: {
        Row: {
          id: string
          title: string
          genre_id: string | null
          bpm: number
          key: string
          duration: number
          price: number
          audio_url: string
          preview_url: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          genre_id?: string | null
          bpm: number
          key: string
          duration: number
          price: number
          audio_url: string
          preview_url: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          genre_id?: string | null
          bpm?: number
          key?: string
          duration?: number
          price?: number
          audio_url?: string
          preview_url?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loops_genre_id_fkey"
            columns: ["genre_id"]
            referencedRelation: "genres"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          is_admin: boolean
          created_at: string
        }
        Insert: {
          id: string
          is_admin?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          is_admin?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      purchases: {
        Row: {
          id: string
          user_id: string
          loop_id: string
          stripe_session_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          loop_id: string
          stripe_session_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          loop_id?: string
          stripe_session_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_loop_id_fkey"
            columns: ["loop_id"]
            referencedRelation: "loops"
            referencedColumns: ["id"]
          }
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
      [_ in never]: never
    }
  }
}

export type Genre = Database['public']['Tables']['genres']['Row']
export type Loop = Database['public']['Tables']['loops']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Purchase = Database['public']['Tables']['purchases']['Row']

export type LoopWithGenre = Loop & {
  genres: Genre | null
}
