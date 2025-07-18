import { createClient } from '@supabase/supabase-js';

/**
 * Get environment variable by key (expects REACT_APP_ prefix in .env)
 * @param {string} key
 * @param {string} fallback
 * @returns {string}
 */
// PUBLIC_INTERFACE
export function getEnv(key, fallback = "") {
  return process.env[`REACT_APP_${key}`] || fallback;
}

// Create a Supabase client using env variables
const SUPABASE_URL = getEnv("SUPABASE_URL");
const SUPABASE_KEY = getEnv("SUPABASE_KEY");

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;
