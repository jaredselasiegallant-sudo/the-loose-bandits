import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-16 prose-measure">
      <p className="meta">404 · Lost in the margins</p>
      <h1 className="font-display text-4xl font-extrabold tracking-tight">
        No bandit stash here — yet.
      </h1>
      <p className="lede mt-4">
        The page you wanted doesn&apos;t exist. Try a writer archive or the home feature.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="btn">
          ← Home
        </Link>
        <Link href="/about" className="btn btn-secondary">
          About
        </Link>
      </div>
    </main>
  );
}
