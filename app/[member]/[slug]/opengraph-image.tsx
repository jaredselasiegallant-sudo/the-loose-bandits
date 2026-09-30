import { ImageResponse } from "next/og";
import { getPost } from "@/lib/posts";
import { memberBySlug } from "@/lib/members";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: Promise<{ member: string; slug: string }>;
}): Promise<ImageResponse> {
  const { member: memberSlug, slug } = await params;
  const post = getPost(memberSlug, slug);
  const member = memberBySlug(memberSlug);
  const color = member?.theme.primary ?? "#1c1917";
  const title = post?.title ?? "The Loose Bandits";
  const name = member?.name ?? "family blog";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#faf6ee",
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ width: 56, height: 12, background: color }} />
          <div style={{ fontSize: 28, letterSpacing: 2 }}>{name}</div>
        </div>
        <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05 }}>{title}</div>
        <div style={{ fontSize: 28, opacity: 0.7 }}>The Loose Bandits · placeholder</div>
      </div>
    ),
    { ...size }
  );
}
