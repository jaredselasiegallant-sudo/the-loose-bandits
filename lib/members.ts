export type MemberSlug = "member-1" | "member-2" | "member-3" | "member-4";

export interface MemberTheme {
  /** Main identity color. Must pair with onPrimary for AA text. */
  primary: string;
  /** Pale tint for chips, card edges, section markers. */
  soft: string;
  /** Text color used on top of `soft`. */
  ink: string;
  /** Text color used on top of `primary`. */
  onPrimary: string;
  /** Dark-mode overrides to keep contrast in dark contexts. */
  dark?: { soft: string; ink: string };
}

export interface Member {
  slug: MemberSlug;
  /** TODO name — founder to supply. */
  name: string;
  /** TODO bio — founder to supply. */
  bio: string;
  /** TODO avatar — URL or null for initials placeholder. */
  avatar: string | null;
  /** TODO color — placeholder palette below is contrast-tested, replace in one place. */
  theme: MemberTheme;
  /** Optional neutral placeholder mark until custom art is supplied. */
  mark: string;
  initials: string;
}

export const MEMBERS: Member[] = [
  {
    slug: "member-1",
    name: "TODO name 1",
    bio: "TODO bio — short placeholder. Founder to supply.",
    avatar: null,
    theme: {
      primary: "#0F766E",
      soft: "#CCFBF1",
      ink: "#134E4A",
      onPrimary: "#FFFFFF",
      dark: { soft: "#134E4A", ink: "#CCFBF1" },
    },
    mark: "★",
    initials: "M1",
  },
  {
    slug: "member-2",
    name: "TODO name 2",
    bio: "TODO bio — short placeholder. Founder to supply.",
    avatar: null,
    theme: {
      primary: "#9A3412",
      soft: "#FFEDD5",
      ink: "#7C2D12",
      onPrimary: "#FFFFFF",
      dark: { soft: "#7C2D12", ink: "#FFEDD5" },
    },
    mark: "▲",
    initials: "M2",
  },
  {
    slug: "member-3",
    name: "TODO name 3",
    bio: "TODO bio — short placeholder. Founder to supply.",
    avatar: null,
    theme: {
      primary: "#6B21A8",
      soft: "#F3E8FF",
      ink: "#581C87",
      onPrimary: "#FFFFFF",
      dark: { soft: "#581C87", ink: "#F3E8FF" },
    },
    mark: "●",
    initials: "M3",
  },
  {
    slug: "member-4",
    name: "TODO name 4",
    bio: "TODO bio — short placeholder. Founder to supply.",
    avatar: null,
    theme: {
      primary: "#3F6212",
      soft: "#ECFCCB",
      ink: "#365314",
      onPrimary: "#FFFFFF",
      dark: { soft: "#365314", ink: "#ECFCCB" },
    },
    mark: "◆",
    initials: "M4",
  },
];

export const memberBySlug = (slug: string): Member | undefined =>
  MEMBERS.find((m) => m.slug === slug);

/** CSS vars for a member scope: --member-primary / --member-soft / --member-ink / --member-on-primary */
export const memberStyle = (m: Member): React.CSSProperties =>
  ({
    "--member-primary": m.theme.primary,
    "--member-soft": m.theme.soft,
    "--member-ink": m.theme.ink,
    "--member-on-primary": m.theme.onPrimary,
  }) as React.CSSProperties;
