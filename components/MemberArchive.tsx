"use client";

import { useMemo, useState } from "react";
import PostCard from "./PostCard";
import { FORMAT_LABEL, type PlaceholderPost, type PostFormat } from "@/lib/posts";

export default function MemberArchive({ posts }: { posts: PlaceholderPost[] }) {
  const [format, setFormat] = useState<PostFormat | "all">("all");
  const [sort, setSort] = useState<"new" | "old" | "long" | "short">("new");

  const formats = useMemo(
    () => Array.from(new Set(posts.map((p) => p.format))),
    [posts]
  );

  const visible = useMemo(() => {
    const filtered = format === "all" ? [...posts] : posts.filter((p) => p.format === format);
    switch (sort) {
      case "old":
        return filtered.sort((a, b) => a.date.localeCompare(b.date));
      case "long":
        return filtered.sort((a, b) => b.readingMinutes - a.readingMinutes);
      case "short":
        return filtered.sort((a, b) => a.readingMinutes - b.readingMinutes);
      default:
        return filtered.sort((a, b) => b.date.localeCompare(a.date));
    }
  }, [posts, format, sort]);

  if (posts.length === 0) {
    return <p className="lede">TODO: no published posts yet for this writer.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex flex-wrap items-center gap-3"
        aria-label="Sort and filter posts"
        onSubmit={(e) => e.preventDefault()}
      >
        <label className="meta" htmlFor="format-filter">
          Format
        </label>
        <select
          id="format-filter"
          value={format}
          onChange={(e) => setFormat(e.target.value as PostFormat | "all")}
          className="rounded-full border-2 border-[var(--foreground)] bg-transparent px-3 py-1.5 text-sm font-bold"
        >
          <option value="all">All formats</option>
          {formats.map((f) => (
            <option key={f} value={f}>
              {FORMAT_LABEL[f]}
            </option>
          ))}
        </select>
        <label className="meta" htmlFor="sort">
          Sort
        </label>
        <select
          id="sort"
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="rounded-full border-2 border-[var(--foreground)] bg-transparent px-3 py-1.5 text-sm font-bold"
        >
          <option value="new">Newest</option>
          <option value="old">Oldest</option>
          <option value="long">Longest read</option>
          <option value="short">Shortest read</option>
        </select>
        <span className="meta" role="status">
          {visible.length} of {posts.length}
        </span>
      </form>
      <div className="grid gap-5 md:grid-cols-2">
        {visible.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
      </div>
    </div>
  );
}
