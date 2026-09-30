import { createServerSupabase } from "./supabase/server";
import { DEFAULT_SETTINGS } from "./site";
import type { SiteSettingsInput } from "./validation";

/** Server source of truth: DB row when Supabase is wired, else seeded defaults. */
export async function getSiteSettingsServer(): Promise<SiteSettingsInput> {
  try {
    const supabase = await createServerSupabase();
    if (!supabase) return DEFAULT_SETTINGS;
    const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
    if (!data) return DEFAULT_SETTINGS;
    return {
      site_title: data.site_title ?? DEFAULT_SETTINGS.site_title,
      wordmark_text: data.wordmark_text ?? DEFAULT_SETTINGS.wordmark_text,
      home_intro: data.home_intro ?? DEFAULT_SETTINGS.home_intro,
      hero_headline: data.hero_headline ?? DEFAULT_SETTINGS.hero_headline,
      hero_deck: data.hero_deck ?? DEFAULT_SETTINGS.hero_deck,
      cta_primary: data.cta_primary ?? DEFAULT_SETTINGS.cta_primary,
      cta_secondary: data.cta_secondary ?? DEFAULT_SETTINGS.cta_secondary,
      about_copy: data.about_copy ?? DEFAULT_SETTINGS.about_copy,
      footer_text: data.footer_text ?? DEFAULT_SETTINGS.footer_text,
      empty_posts_message: data.empty_posts_message ?? DEFAULT_SETTINGS.empty_posts_message,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
