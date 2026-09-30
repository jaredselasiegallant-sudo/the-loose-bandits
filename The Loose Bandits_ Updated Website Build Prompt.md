# The Loose Bandits: Updated Website Build Prompt

Copy everything in **Build brief** into your AI coding assistant. The research appendix is context for the design decisions; use it for inspiration, not imitation.

---

# Build brief

## 1. Product, audience, and guiding idea

Build a dynamic, multi-author **personal family blog** called **The Loose Bandits**, made for the founder and three other family members (four writers total). This is a family publication, not a corporate storefront. It should feel intimate, candid, funny, occasionally chaotic, and worth reading years later.

The core creative direction is **a contemporary family scrapbook crossed with a bold independent literary magazine**: strong editorial typography and calm reading pages, interrupted by deliberately placed color, candid photography, handwritten-feeling notes, paper-like labels, and a small visual vocabulary of stickers. It should feel like the family made it, but with the hierarchy, craft, and usability of a professional publication—not a generic blog theme, a retail homepage, or a wall of random scrapbook decoration.

**Design ambition:** create memorable, unusually expressive art direction and delightful surprises, while keeping essays, navigation, and controls effortless to understand. Be brave with composition and scale; keep the reading column calm.

### Assumptions to keep visible
- “The Loose Bandits” is the working title; do not invent a logo, backstory, family lore, names, portraits, or real post content.
- Use clearly marked placeholders until the founder supplies names, bios, photos, colors, and content.
- “Vessel” in the original notes is assumed to mean **Vercel**. Use Vercel unless the founder corrects this.
- The site is public to read and private to write/manage.

## 2. Hosting and stack

- Deploy on **Vercel**. Do **not** design for GitHub Pages; this is a dynamic application with a backend.
- Preferred stack: **Next.js App Router + TypeScript + Tailwind CSS**, **Supabase** for Postgres, authentication, and image storage, and **Tiptap** (or a well-supported equivalent) for the editor.
- Use environment variables for all secrets and service keys; include a complete `.env.example` with safe placeholder values.
- Explain any material stack change before implementation. Keep the public reading experience fast and server-rendered where practical.

## 3. Art direction and visual system

### Shared brand frame
- Use a warm, paper-like neutral foundation (for example, bone/cream plus near-black ink) as the shared canvas. The actual colors and logo remain configurable; do not lock in an invented family palette.
- Create a consistent editorial grid, spacing scale, navigation, buttons, image treatment, and type hierarchy shared by all four writers.
- Let each member have one **signature color** and one optional supporting tint. Apply those as an identity system—byline/nameplate, small page-edge or card accents, section markers, selected buttons, and sticker details—not as a full-bleed background behind long text.
- Each person should feel unmistakable, but all four sections must still look like one publication. Color must never be the only way the site identifies a writer: pair it with names, avatars/initials, and labels.
- Build the design tokens so the founder can change names, colors, bios, avatars, and optional sticker motifs in one config file or admin screen. Use contrast-tested variables such as `--member-primary`, `--member-soft`, `--member-ink`, and shared surface/text tokens. Derive accessible foregrounds or offer a tested on-color; never assume white text works on every member color.

### Typography
- Pair a high-character display face for titles with an exceptionally legible text face for essays. A good starting direction is **Bricolage Grotesque** (display) with **Source Sans 3** (body), plus a restrained monospaced face such as **IBM Plex Mono** for dates, reading time, and tiny metadata. Equivalent fonts are acceptable if the hierarchy and readability are preserved.
- Use responsive, editorially expressive title sizing; body text should remain comfortable on small screens and in dark mode. Keep article measure around **65–75 characters per line**.
- Load fonts efficiently (prefer `next/font` or self-hosted files with appropriate licenses and fallbacks).

### Expressive details
- Develop a small, cohesive sticker/annotation language: think evidence stamps, arrows, doodles, tape-like labels, handwritten reactions, stars, and small member-specific marks. Treat these as **editorial punctuation** that points to a detail, adds a punchline, identifies a voice, or marks a chapter—not wallpaper.
- Use a tactile visual vocabulary sparingly: subtle paper grain, imperfect edge shapes, layered image cards, scribble underlines, oversize numerals, or a photo-contact-sheet moment. Avoid noisy textures that reduce contrast or hurt performance.
- Make one or two page moments unexpectedly bold: for example, a high-impact home feature, a four-color “same moment / four takes” layout, or a family-lore timeline. Keep transitions and controls predictable.
- Motion may add a small tactile response to stickers, cards, and page transitions. Respect `prefers-reduced-motion`; never make motion necessary to understand content.

## 4. Members and editable configuration

Create four member profiles, each with a name, short bio, avatar/photo (or initials placeholder), one signature color, and optional sticker/mark. Store the starter configuration in one obvious file or admin interface:

- Member 1: `TODO name`, `TODO bio`, `TODO avatar`, `TODO color`
- Member 2: `TODO name`, `TODO bio`, `TODO avatar`, `TODO color`
- Member 3: `TODO name`, `TODO bio`, `TODO avatar`, `TODO color`
- Member 4: `TODO name`, `TODO bio`, `TODO avatar`, `TODO color`

Do not assign real identities or invent personal details. The implementation should make it easy to set the real values later and should remain visually coherent while placeholders are active.

## 5. Pages and information architecture

1. **Home** (`/`)
   - Introduce The Loose Bandits as a personal, four-voice family blog. Use placeholder copy until supplied; do not fabricate family history.
   - Open with a striking editorial feature: a placeholder group/family image or collage area, a punchy headline placeholder, and a direct route to the featured essay. Provide a robust layout when no group image is available.
   - Show four member cards as a unified set, each with a distinct signature color, avatar/initials, short bio placeholder, and a clear “read [member]” destination.
   - Follow with a curated latest-essay feed. Cards should show author, title, short deck/excerpt, date, read time, post format if relevant, and a meaningful image/alt text when available. Author identity must remain clear without color.
   - Include browse paths by **writer**, **topic**, and **format** (e.g. essay, photo note, list, family artifact) only when the corresponding content exists. Add an occasional “Bandits lore” or “four takes” feature as a reusable content format, not fabricated sample content.

2. **Member page** (`/[member]`)
   - Member profile with configurable portrait, bio, signature color, optional sticker mark, and all published posts.
   - Keep shared layout and typography; express the member through a color-coded masthead/nameplate, small details, and post artwork.
   - Add simple sorting/filtering if there are enough posts to make it useful.

3. **Essay page** (`/[member]/[slug]`)
   - Prioritize long-form reading: title, optional subtitle/deck, author, date, estimated reading time, topic/format labels, and a calm measure of roughly 65–75 characters.
   - Support headings, pull quotes, lists, dividers, links, inline/full-width images, captions, and accessible alt text.
   - Allow carefully controlled stickers/annotations in the margins or on/around images; keep body text unobscured and keyboard/screen-reader access intact. Ensure published positions render consistently across screen sizes using responsive anchoring, not fragile arbitrary pixels.
   - Provide previous/next or related stories when useful, plus an unmistakable route back to the author/archive.
   - Include publication metadata and unique SEO title/description/Open Graph image using the writer’s identity color.

4. **About** (`/about`)
   - Present the four people and the purpose of the blog with editable placeholder copy. Do not invent the company story or family details.
   - Make this feel personal and concise, not a corporate “mission and values” page.

5. **Private editor/dashboard** (`/dashboard`, `/write`, or equivalent)
   - Authenticated members can write/edit their own posts, preview, save drafts, publish/unpublish, and schedule posts.
   - Make author identity visible in the editor and preview so writers can see the member theme and sticker behavior before publishing.
   - Provide upload controls, alt-text/caption fields, sticker placement controls, and a reliable save state. The editing experience must be usable on a laptop and a phone/tablet where practical.

6. **Supporting routes**
   - Add a useful not-found page, sitemap, RSS feed, and privacy/terms placeholders only if needed for deployment. Do not create filler pages.

## 6. Editorial content system

- Make the blog more than a reverse-chronological wall. Provide recurring formats that can be enabled when real content exists:
  - **Field Notes** — short observations or photo notes.
  - **Family Lore** — dated stories, objects, places, and memories presented as an optional timeline/archive.
  - **Four Takes / Same Moment** — one shared event told in four voices, with consistent author markers.
  - **Photo Evidence** — image-led essays with captions and restrained annotations.
  These are proposed formats, not claims that such stories already exist; names are editable.
- Use specific, human-first essay headlines and concise decks. Encourage scene-led openings, descriptive section headings, captions, and pull quotes, but do not auto-generate or alter authors’ personal content.
- In the archive, support curated topic tags and a straightforward chronological fallback. Never force users through clever navigation to find a writer or a recent post.
- Give each story format a small label/icon, while reserving signature colors for the author. Keep these two systems distinct to avoid a confusing rainbow of categories.

## 7. Writing, images, and stickers

### Rich text
- Support headings, bold/italic, links, blockquotes/pull quotes, ordered/unordered lists, dividers, captions, and accessible image insertion.
- Sanitize rendered content; validate links and prevent unsafe HTML/script injection.

### Photos
- Support device upload, drag-and-drop, multiple images per post, captions, descriptive alt text, sensible crop/position controls, lazy loading, responsive sizes, and automatic compression/WebP or AVIF conversion where supported.
- Preserve a high-quality original where appropriate; store optimized responsive derivatives. Show upload progress and understandable errors.
- Validate file type and size, use private storage policies where suitable, and rate-limit uploads.

### Stickers and page annotations
- Include a built-in starter library of generic emoji-style/illustrated placeholders, with room for custom packs. Do not invent member-specific sticker art; use neutral placeholders until supplied.
- Allow authorized authors to upload transparent PNG/WebP/SVG files, with strict type/size checks and sanitization for SVG.
- Provide accessible controls to place, move, resize, rotate, and delete stickers. Offer a non-drag alternative (keyboard controls or position presets) and a reset/undo path.
- Support inline stickers and carefully constrained photo/margin overlays. Save positions as responsive/normalized placement data with the post and render consistently on published views. Provide accessible labels/alternative text; decorative stickers should be marked decorative, not announced noisily.
- Add a density limit or preview warning so decorative layers cannot overwhelm the writing or make pages slow.

## 8. Users, roles, and security

- Authenticate the four writers with email magic links or passwords; choose the simplest secure flow supported by the stack.
- Each member can create, edit, and delete only their own posts. An `admin` role (founder) can manage all posts, member profiles, colors, and shared sticker packs.
- Public visitors can read published content without signing in; drafts and scheduled unpublished content remain private.
- Enforce permissions in **Supabase Row Level Security**, not only in the UI. Include schema migrations and policies for members, posts, images/assets, stickers/packs, and sticker placements.
- Validate and sanitize on the server as well as client-side. Protect secret keys, uploads, and preview routes. Include setup guidance for auth redirect URLs and storage policies.

## 9. Accessibility, responsiveness, and performance

- Target **WCAG 2.2 AA** for core interactions and text contrast. Test all four member themes in light and dark contexts. Provide strong focus indicators, keyboard navigation, semantic landmarks, logical headings, form labels, status announcements, reduced motion, and skip links.
- Never rely on color, shape, or sticker position alone to convey author/content meaning. Text on top of imagery must remain readable.
- Mobile-first layouts; test at narrow phone widths, tablet, and desktop. Avoid horizontal overflow; stickers must reposition or be simplified on small screens.
- Use optimized, responsive image delivery, lazy loading below the fold, minimal client JavaScript, and server rendering for public posts where practical. Avoid loading editor/sticker-manipulation code on ordinary reader pages.
- Check Core Web Vitals and real content states (empty archive, missing avatar, long headline, no hero image, long post, upload failure).

## 10. SEO and sharing

- Unique title, description, canonical URL, author/date metadata, and Open Graph/Twitter card for each published essay.
- Generate a sitemap and RSS/Atom feed for public posts. Do not expose drafts, private member data, storage secrets, or admin routes in public metadata.
- Open Graph images may use a consistent post template with the author’s signature color, headline, and supplied photo where available. Keep text legible at social-preview size; provide a safe fallback when no image exists.

## 11. Build stages and deliverables

Before a large build, provide a **short plan** covering architecture, data model, folder structure, and stages; then wait for approval as originally requested. After approval, build in stages:

1. Layout, shared art direction, member configuration, responsive color themes.
2. Home, member archives, and essay reading experience using marked placeholders.
3. Authentication, admin/member roles, dashboard, database schema/migrations, and RLS.
4. Image upload/processing and asset management.
5. Sticker library, placement/editor controls, responsive rendering, and accessible alternatives.
6. SEO/RSS/sitemap, dark mode, performance/accessibility polish, tests, and deployment documentation.

Deliver:
- Working application with the stages above.
- Database schema/migrations and verified RLS policies.
- `.env.example` with no real secrets.
- Step-by-step Vercel + Supabase setup/deploy guide, including auth redirect URLs, storage setup, environment variables, migrations, and seeding placeholders.
- Clear list of what the founder must provide: four names/bios, four signature colors, portraits/avatar choices, logo/wordmark decision, real copy/photos, sticker art, domain, and any privacy/consent decisions for identifiable family photos.

## 12. Acceptance criteria

The work is complete only when:
- The site reads unmistakably as one personal family publication with four clearly distinct author identities—not four unrelated microsites and not a corporate shop.
- A visitor can reach the home page, an author archive, and a published essay quickly on mobile and desktop.
- A long essay is comfortable to read; titles, captions, metadata, pull quotes, and images have a clear hierarchy.
- Member colors can be changed in one place, contrast is verified per theme, and authors remain identifiable without color.
- Stickers can be authored and rendered responsively without covering text; the editor offers keyboard-accessible alternatives.
- Draft/public permissions are enforced by RLS and verified with tests or documented test cases.
- Upload validation, content sanitization, error states, SEO, RSS/sitemap, and reduced-motion behavior are covered.
- Placeholder content remains visibly placeholder content; no invented family facts, identities, photos, or published essays appear.

---

# Global design-research appendix

## What was reviewed

A curated, cross-market scan of nine family-founded/family-controlled/family-stewarded businesses with official storytelling or editorial areas: Denmark, Germany, the United Kingdom, Italy, Switzerland, and the United States. The selection favored sites where editorial structure, visual identity, family history, or human-centered storytelling offered transferable lessons for a four-author personal blog. This is a **design scan, not an exhaustive census** of family businesses. Sites change over time; observations reflect the pages reviewed in September 2026.

## Findings and practical takeaways

| Brand and region | Ownership nuance | Useful observed pattern | Adaptation for The Loose Bandits |
|---|---|---|---|
| [LEGO Group](https://www.lego.com/) — Denmark / global | Majority family-owned indirectly through KIRKBI; the LEGO Foundation holds 25%. | Scannable story modules; vivid hooks; stories about people and the tiny design decisions behind a finished object. | Make ordinary family moments specific and story-shaped. Use a bold opening question, short subheads, process details, captions, and a clearly browsable archive. ([Ownership](https://www.lego.com/en-us/aboutus/lego-group/ownership); [LEGO Stories](https://www.lego.com/en-us/aboutus/newsroom/lego-stories)) |
| [Faber-Castell](https://www.faber-castell.com/) — Germany / global | Ninth-generation family control is stated by the company; current equity percentages were not found in the reviewed sources. | Distinct routes for tutorials/company/product content; clear hero-to-content hierarchy; personal, encouraging creative voice. | Use separate browse paths for writers/topics/formats. Let imperfect, funny, unfinished memories belong; keep an expressive hero followed by calm readable essays. ([Governance](https://www.faber-castell.com/corporate/corporate-management-today); [Creativity story](https://www.faber-castell.com/corporate/creativity-in-your-hands)) |
| [Barbour](https://www.barbour.com/us/) — United Kingdom / global | Describes itself as fifth-generation and family-owned; supported by external cultural coverage, though the current ownership statement is principally the company’s own. | Numbered, human-centered story episodes; place, people, objects, repair, and history connect across time. | Give writers recurring series; build an optional “Family Lore” timeline that links older posts, photos, places, and objects. ([History](https://www.barbour.com/us/our-history.html); [“It’s a Way of Life” stories](https://www.barbour.com/us/bwol-series.html); [BBC Culture](https://www.bbc.com/culture/article/20230609-how-the-barbour-became-the-ultimate-british-symbol)) |
| [Miele](https://www.miele.com/en/) — Germany / global | The 2025 sustainability report says it is wholly owned by the founding Miele and Zinkann families. | Short guiding premise, named principles, numbered people-led episodes, and a decade-based history timeline. | Create repeatable formats such as “Four Takes / Same Moment”; use bold premise + one writer’s first-person story + optional contrasting family response. ([2025 report](https://www.miele.com/media/ex/com/Publikationen/miele_sustainability_report_2025.pdf); [News & Stories](https://www.miele.com/en/c/sustainability-at-miele-news-and-stories-3654.htm)) |
| [Ferrero](https://www.ferrero.com/int/en/) — Italy / global | Family-owned; independent 2025 reporting describes family ownership. Any ownership percentages should be date-qualified, not presented as current legal detail. | Cinematic feature contrasted with restrained page architecture; readable essays with date/read time, thesis-first openings, and descriptive subheads. | Borrow the feature-to-story hierarchy and editorial metadata. Rotate which member/color leads the home feature, but keep the overall composition consistent. ([Family story](https://www.ferrero.com/int/en/news-stories/stories/ferrero-a-family-company); [Forbes, July 2025](https://www.forbes.com/sites/giacomotognini/2025/07/11/meet-the-italian-billionaire-behind-ferreros-giovanni-ferrero-froot-loops-nutella-31-billion-deal-for-kellogg/)) |
| [Dr. Bronner’s](https://www.drbronner.com/) — United States / global | Company states that it remains family-owned and run; current family leadership is identified by the company. | Manifesto-like voice balanced by scannable modules; family history told through dated moments, names, photographs, and captions. | Consider a short, playful editorial label system and a selective “Bandits Lore” timeline. Keep the lived-in, honest quality; do not turn the family into a polished brand myth. ([Family story](https://www.drbronner.com/blogs/ourselves/the-dr-bronners-story); [Leadership](https://info.drbronner.com/media-center/executive-team/)) |
| [Magnolia](https://magnolia.com/) — United States | Chip and Joanna Gaines are identified as co-founders/co-owners of the Magnolia brand; Magnolia Network has a Warner Bros. Discovery partnership, so do not call the whole network exclusively family-owned. | Topic/seasonal story groupings; first-person essays with a named author, memorable scene, illustration or photograph, and pull quote. | Use recognizable bylines and recurring columns, but replace lifestyle polish with this family’s own voice. Keep personal narrative at the center and illustrations/stickers as annotations. ([About](https://magnolia.com/pages/about); [Blog](https://magnolia.com/pages/blog); [Joanna essay](https://magnolia.com/blogs/article/note-from-jo-on-linger-longer)) |
| [Ritter Sport](https://www.ritter-sport.com/) — Germany / global | Describes itself as a family business and identifies descendants of the founders in leadership; full shareholding details were not in the reviewed sources. | Date-led timeline with compact, playful headlines; clear visual system for variety held within one recognizable frame. | Use the four colors as an intentional “band” or four-square identity, and give family memories short, memorable titles. Preserve one shared layout around distinct personalities. ([History](https://www.ritter-sport.com/history); [About](https://www.ritter-sport.com/about-us)) |
| [Victorinox](https://www.victorinox.com/en-US/) — Switzerland / global | Family-led stewardship is evidenced, but ownership is foundation-held (90% Victorinox Foundation, 10% Carl and Elise Elsener-Gut Foundation), not straightforward direct family ownership. | Craft profile built around one person/object, sensory detail, concrete facts, and a transformation-led title. | Make essays tactile and specific: anchor each in a person, object, place, or mystery; use stickers as chapter marks and keep the text itself readable. ([Official ownership/history](https://www.victorinox.com/en-CH/All-about-Victorinox/History/cms/history/); [Stories](https://www.victorinox.com/en-US/Inspiration-Stories/cms/swiss-army-knives-stories/); [Craft profile](https://www.victorinox.com/en-US/Swiss-Army-Knives/Inspiration/The-last-cutler/cms/the-last-cutler/)) |

## Synthesis: the design direction to build

The strongest shared lesson is not “make it look like a famous family company.” It is to make **people, specific moments, and recurring story structures** easy to recognize and revisit. For The Loose Bandits, combine:

1. **A calm editorial chassis:** shared navigation, consistent grid, typography, post metadata, and excellent long-form reading.
2. **Four unmistakable author signatures:** restrained but vivid color identity, portrait/nameplate, and one optional recurring mark per writer.
3. **One expressive family stage:** a high-impact home feature or collage that can spotlight one writer or a real shared story, without requiring invented imagery.
4. **A browsable living archive:** author, topic, format, chronology, and optional linked family-lore timeline.
5. **Stickers with meaning:** annotate, point, label, or make a joke; never obstruct text or substitute for accessible labels.
6. **A human voice over a brand voice:** specific scenes, candid captions, vivid headlines, first-person authorship, and room for different temperaments.

**Do not copy** any one brand’s look, assets, slogans, or proprietary illustration style. Borrow high-level interaction and editorial patterns and create an original visual language for the family.

---

## Notes for the founder

Before implementation, supply or decide:
- Confirm the final title/wordmark and that “Vessel” means Vercel.
- Four member names, short bios, avatar/portrait approach, and signature colors.
- Whether member colors are already chosen or need accessible palette suggestions.
- A logo/wordmark, if one exists; otherwise retain a typographic placeholder.
- A first set of real essays/photos and any photo-consent rules for family members, especially children.
- Sticker artwork or permission to create original starter SVGs after the visual direction is approved.
- Domain, Vercel project, Supabase project, and authentication choice.
