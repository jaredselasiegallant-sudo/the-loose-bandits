import type { MemberSlug } from "./members";

export type PostFormat =
  | "essay"
  | "field-note"
  | "family-lore"
  | "four-takes"
  | "photo-evidence";

export const FORMAT_LABEL: Record<PostFormat, string> = {
  essay: "Essay",
  "field-note": "Field Notes",
  "family-lore": "Family Lore",
  "four-takes": "Four Takes",
  "photo-evidence": "Photo Evidence",
};

export interface PlaceholderPost {
  slug: string;
  memberSlug: MemberSlug;
  title: string;
  deck: string;
  date: string; // ISO
  readingMinutes: number;
  format: PostFormat;
  topics: string[];
  excerpt: string;
  /** Minimal block model — real rich text ships with Tiptap in Stage 4/5. */
  body: Array<
    | { type: "p"; text: string }
    | { type: "h2"; text: string }
    | { type: "quote"; text: string }
    | { type: "list"; items: string[] }
    | { type: "image"; caption: string; alt: string }
  >;
  coverAlt: string;
}

/**
 * Clearly-marked placeholders. No family facts invented — founder replaces
 * these with real essays/photos.
 */
export const PLACEHOLDER_POSTS: PlaceholderPost[] = [
  {
    slug: "placeholder-featured-essay",
    memberSlug: "member-1",
    title: "TODO: featured essay title — founder to supply",
    deck: "TODO deck: one-sentence summary placeholder.",
    date: "2026-09-01",
    readingMinutes: 6,
    format: "essay",
    topics: ["TODO-topic"],
    excerpt:
      "TODO excerpt placeholder. Scene-led opening goes here once real copy is supplied.",
    body: [
      { type: "p", text: "TODO paragraph 1 — placeholder body copy. Real story to be supplied; this text exists only to prove the reading measure, hierarchy, and caption styles." },
      { type: "h2", text: "TODO section heading placeholder" },
      { type: "p", text: "TODO paragraph 2 — placeholder. Pull quotes, lists, dividers, and captioned images below show the essay system without inventing family facts." },
      { type: "quote", text: "TODO pull quote placeholder — real line from the essay will appear here." },
      { type: "list", items: ["TODO list item one", "TODO list item two", "TODO list item three"] },
      { type: "image", caption: "TODO caption — placeholder image frame. Alt text describes the empty state.", alt: "Placeholder image frame, no real photo supplied yet" },
      { type: "p", text: "TODO closing paragraph placeholder." },
    ],
    coverAlt: "Placeholder cover frame, no real photo yet",
  },
  {
    slug: "placeholder-field-note",
    memberSlug: "member-2",
    title: "TODO: field note title",
    deck: "TODO deck for a short observation placeholder.",
    date: "2026-08-24",
    readingMinutes: 2,
    format: "field-note",
    topics: ["TODO-topic"],
    excerpt: "TODO short observation placeholder.",
    body: [{ type: "p", text: "TODO field-note body placeholder." }],
    coverAlt: "Placeholder photo-note frame",
  },
  {
    slug: "placeholder-photo-evidence",
    memberSlug: "member-3",
    title: "TODO: photo evidence title",
    deck: "TODO deck for an image-led placeholder.",
    date: "2026-08-18",
    readingMinutes: 4,
    format: "photo-evidence",
    topics: ["TODO-topic", "TODO-place"],
    excerpt: "TODO image-led excerpt placeholder.",
    body: [
      { type: "p", text: "TODO photo-essay intro placeholder." },
      { type: "image", caption: "TODO caption one — placeholder.", alt: "Placeholder photo frame one" },
      { type: "image", caption: "TODO caption two — placeholder.", alt: "Placeholder photo frame two" },
    ],
    coverAlt: "Placeholder photo essay cover",
  },
  {
    slug: "placeholder-four-takes",
    memberSlug: "member-4",
    title: "TODO: four-takes entry title (1 of 4)",
    deck: "TODO deck — same moment told in four voices (format demo).",
    date: "2026-08-10",
    readingMinutes: 5,
    format: "four-takes",
    topics: ["TODO-shared-moment"],
    excerpt: "TODO excerpt — voice 4 of a shared-moment placeholder.",
    body: [
      { type: "p", text: "TODO four-takes body placeholder. The other three voices will link here once real content exists." },
      { type: "quote", text: "TODO contrasting response placeholder." },
    ],
    coverAlt: "Placeholder four-takes cover",
  },
  {
    slug: "placeholder-lore-entry",
    memberSlug: "member-1",
    title: "TODO: family lore entry title",
    deck: "TODO deck — dated memory placeholder for the lore timeline.",
    date: "2026-07-30",
    readingMinutes: 3,
    format: "family-lore",
    topics: ["TODO-lore"],
    excerpt: "TODO lore excerpt placeholder.",
    body: [{ type: "p", text: "TODO lore body placeholder with object/place anchor." }],
    coverAlt: "Placeholder lore cover",
  },
  {
    slug: "placeholder-second-essay",
    memberSlug: "member-2",
    title: "TODO: second essay title",
    deck: "TODO deck placeholder.",
    date: "2026-07-20",
    readingMinutes: 7,
    format: "essay",
    topics: ["TODO-topic"],
    excerpt: "TODO excerpt placeholder.",
    body: [
      { type: "p", text: "TODO essay body placeholder paragraph one." },
      { type: "h2", text: "TODO heading placeholder" },
      { type: "p", text: "TODO essay body placeholder paragraph two." },
    ],
    coverAlt: "Placeholder essay cover",
  },
];

export const getPublishedPosts = (): PlaceholderPost[] =>
  [...PLACEHOLDER_POSTS].sort((a, b) => b.date.localeCompare(a.date));

export const getPostsByMember = (slug: string): PlaceholderPost[] =>
  getPublishedPosts().filter((p) => p.memberSlug === slug);

export const getPost = (member: string, slug: string): PlaceholderPost | undefined =>
  PLACEHOLDER_POSTS.find((p) => p.memberSlug === member && p.slug === slug);

export const allTopics = (): string[] =>
  Array.from(new Set(PLACEHOLDER_POSTS.flatMap((p) => p.topics))).sort();

export const allFormats = (): PostFormat[] =>
  Array.from(new Set(PLACEHOLDER_POSTS.map((p) => p.format)));

export const formatDate = (iso: string): string =>
  new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
