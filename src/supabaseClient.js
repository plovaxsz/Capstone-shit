import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error('Missing Supabase environment variables. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

// --- ADD THIS LINE FOR DEBUGGING ---
//console.log("Supabase URL from env:", supabaseUrl);
// --- END DEBUGGING LINE ---

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		storageKey: 'employee-tracker-auth',
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: true,
	},
});
