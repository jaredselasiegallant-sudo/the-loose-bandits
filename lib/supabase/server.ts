import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function createServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon || url.includes("placeholder")) return null;
  const store = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value, options }) => {
          try {
            store.set(name, value, options);
          } catch {
            /* read-only in some RSC contexts — middleware refreshes instead */
          }
        });
      },
    },
  });
}
