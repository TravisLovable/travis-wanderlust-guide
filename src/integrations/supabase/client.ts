import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

/** Invoke an Edge Function and throw with a descriptive message on failure. */
export async function invokeFunction<T = unknown>(
  name: string,
  body?: Record<string, unknown>
): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T & { error?: string }>(name, { body });
  if (error) {
    const msg = typeof data?.error === 'string' ? data.error : error.message;
    const hint = error.message === 'Failed to fetch'
      ? ' (Check Supabase URL in .env.local and that the project is running.)'
      : '';
    throw new Error(`Edge Function "${name}": ${msg}${hint}`);
  }
  return data as T;
}