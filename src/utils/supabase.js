import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://creeorxpcmzpcgtzcxaw.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// @supabase/ssr browser client instance that automatically manages auth cookies
export const supabase = createBrowserClient(supabaseUrl, supabaseKey);
