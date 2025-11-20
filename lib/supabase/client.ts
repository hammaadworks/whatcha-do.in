import { createBrowserClient } from '@supabase/ssr'

// Replit Secrets may have the values swapped, so we validate and swap if needed
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Check if they're swapped (URL should start with https://, key with eyJ)
if (supabaseUrl.startsWith('eyJ') && supabaseAnonKey.startsWith('https://')) {
  console.log('⚠️  Swapping URL and KEY (they were reversed)');
  [supabaseUrl, supabaseAnonKey] = [supabaseAnonKey, supabaseUrl];
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
}

export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
)
