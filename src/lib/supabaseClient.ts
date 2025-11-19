import { createClient } from '@supabase/supabase-js';

// Define types locally to satisfy TypeScript if vite/client types are not globally available
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ViteImportMeta {
  readonly env: ImportMetaEnv;
}

// Initialize the Supabase client
// These environment variables must be set in your .env file
const meta = import.meta as unknown as ViteImportMeta;
const supabaseUrl = meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);