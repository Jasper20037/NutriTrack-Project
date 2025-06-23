export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      food_items: {
        Row: {
          id: string
          user_id: string
          name: string
          serving: string
          calories: number
          protein: number
          carbs: number
          fat: number
          sugar: number
          logged_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          serving: string
          calories: number
          protein: number
          carbs: number
          fat: number
          sugar: number
          logged_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          serving?: string
          calories?: number
          protein?: number
          carbs?: number
          fat?: number
          sugar?: number
          logged_at?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
