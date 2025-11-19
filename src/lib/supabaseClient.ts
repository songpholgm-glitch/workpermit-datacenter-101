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
const meta = import.meta as unknown as ViteImportMeta;

// Use fallback values to prevent app crash during initialization if env vars are missing
// This allows the UI to render even if the backend connection fails later
const supabaseUrl = meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (!meta.env.VITE_SUPABASE_URL || !meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Supabase URL or Anon Key is missing. Please check your Vercel Project Settings (Environment Variables).');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);