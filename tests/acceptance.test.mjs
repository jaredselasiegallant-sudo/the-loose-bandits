import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

describe("member config (Stage 1)", () => {
  it("has four TODO placeholders with theme tokens", () => {
    const src = read("lib/members.ts");
    for (const n of ["member-1", "member-2", "member-3", "member-4"]) {
      assert.match(src, new RegExp(n), `missing ${n}`);
    }
    assert.match(src, /TODO name/, "names must stay TODO placeholders");
    assert.match(src, /--member-primary/, "must expose --member-primary token");
    assert.match(src, /onPrimary/, "must define accessible on-color");
  });
});

describe("placeholder posts (Stage 2)", () => {
  it("titles stay visibly TODO, no invented family facts", () => {
    const src = read("lib/posts.ts");
    assert.match(src, /TODO: featured essay title/, "featured must be TODO");
    const titles = [...src.matchAll(/title: "([^"]+)"/g)].map((m) => m[1]);
    assert.ok(titles.length >= 6, "expected >=6 placeholder posts");
    for (const t of titles) assert.match(t, /TODO/, `title invents content: ${t}`);
  });
});

describe("auth + RLS (Stage 3)", () => {
  it("migration enforces published-only public reads", () => {
    const sql = read("supabase/migrations/0001_init.sql");
    assert.match(sql, /enable row level security/, "RLS must be enabled");
    assert.match(sql, /posts public read published/, "needs published-only policy");
    assert.match(sql, /status = 'published'/, "public reads gated on published");
    assert.match(sql, /is_admin\(\)/, "needs admin helper");
  });
  it("storage policies exist", () => {
    const sql = read("supabase/migrations/0002_storage.sql");
    assert.match(sql, /bandit-images/, "needs image bucket policy");
  });
});

describe("images + stickers (Stages 4/5)", () => {
  it("validates type/size and guards density", () => {
    const img = read("lib/images.ts");
    assert.match(img, /image\/webp/, "must accept modern formats");
    assert.match(img, /MAX_PER_POST/, "needs density guard");
    const stk = read("lib/stickers.ts");
    assert.match(stk, /STARTER_STICKERS/, "needs starter library");
    assert.match(stk, /MAX_STICKERS_PER_POST/, "needs sticker density limit");
    assert.match(stk, /0\.\.1/, "placements must be normalized");
  });
});

describe("addendum: sign-in + editable content", () => {
  it("protects private routes via middleware with login redirect", () => {
    const src = read("middleware.ts");
    assert.match(src, /\/dashboard/, "must guard dashboard");
    assert.match(src, /\/preview/, "must guard preview");
    assert.match(src, /\/login/, "signed-out visitors redirect to login");
  });
  it("offers sign-out + session state, no public self-registration", () => {
    assert.ok(fs.existsSync(path.join(root, "components/SignOutButton.tsx")), "needs sign-out");
    const header = read("components/AuthHeader.tsx");
    assert.match(header, /Dashboard/, "signed-in state links to dashboard");
    const all = ["components/LoginForm.tsx", "app/api/admin/invite/route.ts"].map(read).join("\n");
    assert.doesNotMatch(all, /signUp/, "no public self-registration");
    assert.match(read("app/api/admin/invite/route.ts"), /SERVICE_ROLE/, "invites use server-only service key");
    assert.match(read("app/api/admin/invite/route.ts"), /role.*admin/i, "invite route verifies admin");
  });
  it("stores copy in DB with revisions + archiving, seeded TODO", () => {
    const sql = read("supabase/migrations/0003_content.sql");
    assert.match(sql, /site_settings/, "needs site_settings table");
    assert.match(sql, /post_revisions/, "needs revision history");
    assert.match(sql, /archived_at/, "needs soft-delete");
    assert.match(sql, /settings public read/, "public reads copy, admin writes");
    assert.match(sql, /archived_at is null/, "public feed excludes archived");
  });
  it("server routes re-check ownership/role and validate", () => {
    for (const f of ["app/api/settings/route.ts", "app/api/members/route.ts", "app/api/posts/route.ts", "app/api/media/route.ts"]) {
      const src = read(f);
      assert.match(src, /getUser/, `${f} must verify session server-side`);
      assert.match(src, /503/, `${f} must degrade gracefully in demo`);
    }
    assert.match(read("app/api/members/route.ts"), /only edit your own/, "members cannot edit others");
    assert.match(read("lib/validation.ts"), /isHexColor/, "colors validated");
  });
  it("dashboard has all sections, preview stays private", () => {
    const tabs = read("components/dashboard/DashboardTabs.tsx");
    for (const t of ["Posts", "Pages", "Members", "Media", "Settings"]) assert.match(tabs, new RegExp(t), `missing ${t} tab`);
    const preview = read("app/preview/[id]/page.tsx");
    assert.match(preview, /index: false/, "preview must be noindex");
    assert.match(preview, /only preview your own/, "preview enforces ownership");
    assert.doesNotMatch(read("app/sitemap.ts"), /preview/, "preview excluded from sitemap");
  });
  it("media warns on in-use archive and requires alt text", () => {
    const src = read("components/dashboard/MediaManager.tsx");
    assert.match(src, /is used by/, "must show usage");
    assert.match(src, /Alt text is required|alt text is required/i, "alt text required");
    assert.match(src, /Archive/, "archive with warning, never silent delete");
  });
});
describe("seo + env (Stage 6)", () => {
  it("sitemap, rss, robots exist and env has no secrets", () => {
    assert.ok(fs.existsSync(path.join(root, "app/sitemap.ts")));
    assert.ok(fs.existsSync(path.join(root, "app/rss/route.ts")));
    assert.ok(fs.existsSync(path.join(root, "app/robots.ts")));
    const env = read(".env.example");
    assert.match(env, /NEXT_PUBLIC_SUPABASE_URL/, "env example needs supabase url");
    assert.doesNotMatch(env, /sk-live|secret-key-[A-Za-z0-9]{8}/, "no real secrets");
  });
});
