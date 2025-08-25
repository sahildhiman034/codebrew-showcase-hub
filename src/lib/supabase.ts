import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mscltrtuhipjdelehbre.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zY2x0cnR1aGlwamRlbGVoYnJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5Mjg2OTUsImV4cCI6MjA3MTUwNDY5NX0.Fmv1atNhxk9NBV9hwwRGgoHdE6ocE5y0vh4AxJhR_aI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Category {
  id: string
  name: string
  description?: string
  icon?: string
  created_at: string
  updated_at: string
}

export interface DemoProject {
  id: string
  category_id: string
  name: string
  description?: string
  demo_videos: string[]
  admin_panel_url?: string
  admin_credentials?: {
    username: string
    password: string
  }
  dispatcher_panel_url?: string
  dispatcher_credentials?: {
    username: string
    password: string
  }
  android_user_app?: string
  android_driver_app?: string
  ios_user_app?: string
  ios_driver_app?: string
  created_at: string
  updated_at: string
}

export interface LiveClient {
  id: string
  category_id: string
  name: string
  description?: string
  admin_panel_url?: string
  dispatcher_panel_url?: string
  android_user_app?: string
  android_driver_app?: string
  ios_user_app?: string
  ios_driver_app?: string
  website_url?: string
  status: 'active' | 'inactive' | 'maintenance'
  created_at: string
  updated_at: string
}

export interface StatusMonitor {
  id: string
  client_id: string
  url: string
  status: 'online' | 'offline'
  last_checked: string
  response_time?: number
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  phone_number?: string
  password: string
  full_name?: string
  role: 'admin' | 'user' | 'vendor'
  is_email_verified: boolean
  is_phone_verified: boolean
  is_verified: boolean
  is_active: boolean
  is_vendor_created: boolean
  email_verification_token?: string
  phone_verification_otp?: string
  phone_verification_expires?: string
  last_login?: string
  created_at: string
  updated_at: string
}