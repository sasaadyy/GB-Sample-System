import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ⚠️ GANTI dengan URL & anon key project Supabase Anda
export const supabase = createClient(
  'https://GANTI_PROJECT_ID.supabase.co',
  'GANTI_ANON_KEY'
);
