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
  // Accepts SUPABASE_URL, SUPABASE_KEY, etc. (no prefix required)
  return (
    // Try full env, fallback to process.env for testing environments
    (window?.ENV && window.ENV[key]) ||
    process.env[`REACT_APP_${key}`] ||
    fallback
  );
}

/**
 * Returns the Supabase config (URL/KEY) as an object for runtime checks.
 */
function getSupabaseConfig() {
  const SUPABASE_URL = getEnv("SUPABASE_URL", "");
  const SUPABASE_KEY = getEnv("SUPABASE_KEY", "");
  return { SUPABASE_URL, SUPABASE_KEY };
}

/**
 * Get Supabase config validation error string, or null if config is valid.
 * Useful for runtime UI fallback instead of throwing.
 * @returns {string|null}
 */
// PUBLIC_INTERFACE
export function getSupabaseConfigError() {
  const { SUPABASE_URL, SUPABASE_KEY } = getSupabaseConfig();
  if (!SUPABASE_URL)
    return "Supabase URL missing! Please set REACT_APP_SUPABASE_URL in your .env file.";
  if (!SUPABASE_KEY)
    return "Supabase KEY missing! Please set REACT_APP_SUPABASE_KEY in your .env file.";
  return null;
}

// For development, alert and throw; in production, just log but allow app to display user fallback UI
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

/**
 * Runtime-safe lazy initialization of Supabase client.
 * Will only instantiate if config is valid, else remains null and lets UI handle errors.
 */
// PUBLIC_INTERFACE
let _supabase = null;
function getSupabaseClient() {
  if (_supabase) return _supabase; // Singleton pattern, create only once
  const configError = getSupabaseConfigError();
  const { SUPABASE_URL, SUPABASE_KEY } = getSupabaseConfig();

  if (configError) {
    if (process.env.NODE_ENV !== "production") {
      throwConfigError(configError);
    }
    // In production, delay error and do NOT instantiate broken client
    return null;
  }
  _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  return _supabase;
}

// PUBLIC_INTERFACE
export const supabase = getSupabaseClient();

export default supabase;
