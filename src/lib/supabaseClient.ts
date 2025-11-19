// Fix: Add reference to vite/client types to resolve import.meta.env TS errors
/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// These environment variables must be set in your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);