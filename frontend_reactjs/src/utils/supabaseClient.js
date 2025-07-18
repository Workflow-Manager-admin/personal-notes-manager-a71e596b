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


function throwConfigError(msg) {
  // Intentionally break the app in development, provide console message in production build
  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-alert
    if (process.env.NODE_ENV !== "production") {
      alert(msg);
    }
    // eslint-disable-next-line no-console
    console.error(`[Supabase Config] ${msg}`);
  }
}

// Defensive runtime validation
if (!SUPABASE_URL) {
  throwConfigError(
    "Supabase URL missing! Please set REACT_APP_SUPABASE_URL in your .env file."
  );
}
if (!SUPABASE_KEY) {
  throwConfigError(
    "Supabase KEY missing! Please set REACT_APP_SUPABASE_KEY in your .env file."
  );
}

// Instantiate Supabase (may throw if params are empty strings)
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;
