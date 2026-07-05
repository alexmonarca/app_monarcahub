import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/env';

// Cliente único (singleton) para uso em toda a aplicação.
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);

// Cliente opcional para o projeto de parceiros comerciais.
export const partnersSupabase =
  env.partnersSupabaseUrl && env.partnersSupabaseAnonKey
    ? createClient(env.partnersSupabaseUrl, env.partnersSupabaseAnonKey)
    : null;
