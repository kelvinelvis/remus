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
      auth_tokens: {
        Row: {
          accessToken: string
          active: boolean
          code: string
          created_at: string
          id: number
          refreshToken: string
          state: string
          systemText: string
          user: string
        }
        Insert: {
          accessToken: string
          active?: boolean
          code?: string
          created_at?: string
          id?: number
          refreshToken: string
          state: string
          systemText?: string
          user: string
        }
        Update: {
          accessToken?: string
          active?: boolean
          code?: string
          created_at?: string
          id?: number
          refreshToken?: string
          state?: string
          systemText?: string
          user?: string
        }
        Relationships: []
      }
      fine_tunes: {
        Row: {
          created_at: string | null
          id: number
          jobId: string
          modelName: string
          prompt: string
          temprature: number
        }
        Insert: {
          created_at?: string | null
          id?: number
          jobId?: string
          modelName?: string
          prompt?: string
          temprature: number
        }
        Update: {
          created_at?: string | null
          id?: number
          jobId?: string
          modelName?: string
          prompt?: string
          temprature?: number
        }
        Relationships: []
      }
      tagged_tweets: {
        Row: {
          conversation_id: string
          created_at: string
          id: number
          referenced_tweet: string
          saved: boolean
          tweet_id: string
          tweet_text: string
          tweeter: string
        }
        Insert: {
          conversation_id?: string
          created_at?: string
          id?: number
          referenced_tweet?: string
          saved?: boolean
          tweet_id?: string
          tweet_text?: string
          tweeter?: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: number
          referenced_tweet?: string
          saved?: boolean
          tweet_id?: string
          tweet_text?: string
          tweeter?: string
        }
        Relationships: []
      }
      tweets: {
        Row: {
          content: string
          created_at: string
          id: number
          media: string | null
          tweet_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: number
          media?: string | null
          tweet_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          media?: string | null
          tweet_id?: string
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
