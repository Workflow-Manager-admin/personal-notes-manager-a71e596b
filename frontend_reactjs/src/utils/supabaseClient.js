import { createClient } from '@supabase/supabase-js';

/**
 * Get environment variable by key (expects REACT_APP_ prefix in .env)
 * Returns a fallback or undefined if not present.
 * @param {string} key
 * @param {string} fallback
 * @returns {string}
 */
// PUBLIC_INTERFACE
export function getEnv(key, fallback = "") {
  return process.env[`REACT_APP_${key}`] || fallback;
}

// Read Supabase config from env and validate
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY || "";

/**
 * Get Supabase config validation error string, or null if config is valid.
 * Useful for runtime UI fallback instead of throwing.
 * @returns {string|null}
 */
// PUBLIC_INTERFACE
export function getSupabaseConfigError() {
  if (!SUPABASE_URL) return "Supabase URL missing! Please set REACT_APP_SUPABASE_URL in your .env file.";
  if (!SUPABASE_KEY) return "Supabase KEY missing! Please set REACT_APP_SUPABASE_KEY in your .env file.";
  return null;
}

// For development, throw a clear error. For production, only log and GUARD instantiation.
function throwConfigError(msg) {
  if (typeof window !== "undefined") {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-alert
      alert(msg);
      throw new Error(msg);
    }
    // eslint-disable-next-line no-console
    console.error(`[Supabase Config] ${msg}`);
  }
}

// Defensive runtime validation
const configError = getSupabaseConfigError();
if (configError) {
  if (process.env.NODE_ENV !== "production") {
    throwConfigError(configError);
  }
  // In production, delay error to the UI layer (return a "broken" client with a guard)
}

// Instantiate Supabase only if config is valid
export const supabase =
  !configError ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

export default supabase;
