import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Menyimpan sesi di localStorage (default)
    autoRefreshToken: true, // Otomatis memperbarui token yang kadaluarsa
    detectSessionInUrl: true, // Penting untuk proses konfirmasi email/invitation
  },
});