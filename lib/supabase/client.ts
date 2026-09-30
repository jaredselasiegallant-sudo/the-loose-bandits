import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon || url.includes("placeholder")) {
    return null; // placeholder env — auth UI shows setup notice, build stays green
  }
  return createBrowserClient(url, anon);
}
