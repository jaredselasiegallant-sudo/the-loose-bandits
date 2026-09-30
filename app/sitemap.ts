import type { MetadataRoute } from "next";
import { PLACEHOLDER_POSTS } from "@/lib/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const now = new Date();
  const staticRoutes = ["", "/about", "/login", "/dashboard", "/write"].map((p) => ({
    url: `${base}${p || "/"}`,
    lastModified: now,
  }));
  const posts = PLACEHOLDER_POSTS.map((p) => ({
    url: `${base}/${p.memberSlug}/${p.slug}`,
    lastModified: new Date(p.date),
  }));
  const members = ["member-1", "member-2", "member-3", "member-4"].map((m) => ({
    url: `${base}/${m}`,
    lastModified: now,
  }));
  return [...staticRoutes, ...members, ...posts];
}
