import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Post {
  id: string
  title: string
  content: string
  excerpt: string
  slug: string
  is_premium: boolean
  published: boolean
  created_at: string
  updated_at: string
  author_id: string
  author?: {
    email: string
    full_name?: string
  }
}

export interface Profile {
  id: string
  email: string
  full_name?: string
  is_premium: boolean
  stripe_customer_id?: string
  created_at: string
}
