import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mscltrtuhipjdelehbre.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zY2x0cnR1aGlwamRlbGVoYnJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5Mjg2OTUsImV4cCI6MjA3MTUwNDY5NX0.Fmv1atNhxk9NBV9hwwRGgoHdE6ocE5y0vh4AxJhR_aI'

// Create Supabase client with production-ready configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable automatic redirects to prevent localhost issues
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Prevent automatic session detection from URL
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'codebrew-showcase-hub'
    }
  }
})

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

// Chatbot Types
export interface ChatbotSession {
  id: string
  visitor_id: string
  session_start: string
  session_end?: string
  total_messages: number
  visitor_info?: any
  status: 'active' | 'ended' | 'archived'
  created_at: string
  updated_at: string
}

export interface ChatbotMessage {
  id: string
  session_id: string
  visitor_id: string
  message_type: 'text' | 'image' | 'file' | 'system'
  sender_type: 'user' | 'bot' | 'admin'
  content: string
  metadata?: any
  response_time_ms?: number
  created_at: string
}

export interface ChatbotFAQ {
  id: string
  question: string
  answer: string
  category?: string
  keywords?: string[]
  priority: number
  is_active: boolean
  usage_count: number
  created_by?: string
  created_at: string
  updated_at: string
}

export interface ChatbotSetting {
  id: string
  setting_key: string
  setting_value?: string
  setting_type: 'string' | 'number' | 'boolean' | 'json'
  description?: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface ChatbotAnalytics {
  id: string
  date: string
  total_sessions: number
  total_messages: number
  unique_visitors: number
  avg_response_time_ms: number
  satisfaction_score?: number
  most_common_questions?: any
  created_at: string
}