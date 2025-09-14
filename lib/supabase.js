import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Replace these with your actual Supabase URL and anon key
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://ttsnmtoghmhsvtamgipg.supabase.co"
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c25tdG9naG1oc3Z0YW1naXBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NjQ5NzgsImV4cCI6MjA3MzQ0MDk3OH0.t3YKLd8ig5qbwM3px-zV7i-USqePepruS6vpQ7txYkg"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})