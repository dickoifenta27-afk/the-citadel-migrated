import { createClient } from '@supabase/supabase-js'

// Supabase Configuration - Your Cloud Instance
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kdclnuztnvdawjcbefub.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  }
})

console.log('Supabase client initialized with URL:', supabaseUrl)
