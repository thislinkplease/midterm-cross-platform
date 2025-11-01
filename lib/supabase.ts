import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const fromEnv = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL,
  key: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
};

const fromExtra = Constants.expoConfig?.extra as
  | { EXPO_PUBLIC_SUPABASE_URL?: string; EXPO_PUBLIC_SUPABASE_ANON_KEY?: string }
  | undefined;

const supabaseUrl =
  fromEnv.url ??
  fromExtra?.EXPO_PUBLIC_SUPABASE_URL ??
  '';

const supabaseAnonKey =
  fromEnv.key ??
  fromExtra?.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase envs', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey,
    fromEnv,
    fromExtra,
  });
  throw new Error('Supabase URL/Anon key not found. Check app.json -> expo.extra.* or process.env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
