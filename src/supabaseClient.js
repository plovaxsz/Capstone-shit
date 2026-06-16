// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Correctly READ the variables defined in your .env.local file
// NOTE: For security, do NOT paste secrets into the chat. Replace the
// placeholder values below locally or create a `.env.local` file at the
// project root with the two VITE_* entries shown in the README.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'REPLACE_WITH_YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'REPLACE_WITH_YOUR_SUPABASE_ANON_KEY'

// --- ADD THIS LINE FOR DEBUGGING ---
console.log("Supabase URL from env:", supabaseUrl);
// --- END DEBUGGING LINE ---

export const supabase = createClient(supabaseUrl, supabaseAnonKey)