"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function friendlyError(message: string): string {
  if (/rate limit/i.test(message)) return "Too many attempts. Wait a minute and try again.";
  if (/invalid/i.test(message)) return "That email doesn't look right. Check it and try again.";
  if (/redirect/i.test(message))
    return "Sign-in link misconfigured. The admin must add this URL in Supabase → Auth → URL Configuration.";
  return message;
}

export default function LoginForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkError = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);

  if (!supabase) {
    return (
      <div className="hero" role="note" aria-label="Auth not configured">
        <p className="meta">Auth · setup required</p>
        <p className="lede mt-2">
          Supabase env vars are placeholders. Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in Vercel + <code>.env.local</code>, then
          run the migrations in order. See DEPLOY.md. No public self-registration: the admin
          invites the four member accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="flex max-w-md flex-col gap-4">
      <div className="flex gap-2" role="group" aria-label="Sign-in method">
        {(["magic", "password"] as const).map((m) => (
          <button
            key={m}
            type="button"
            className={`btn ${mode === m ? "" : "btn-secondary"}`}
            aria-pressed={mode === m}
            onClick={() => {
              setMode(m);
              setStatus("");
            }}
          >
            {m === "magic" ? "Magic link" : "Password"}
          </button>
        ))}
      </div>
      <form
        className="hero flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setStatus(mode === "magic" ? "Sending magic link…" : "Signing in…");
          try {
            if (mode === "magic") {
              const { error } = await supabase.auth.signInWithOtp({
                email,
                options: { emailRedirectTo: `${window.location.origin}/auth/confirm?next=/dashboard` },
              });
              setStatus(error ? `Error: ${friendlyError(error.message)}` : "Check your email for the sign-in link.");
            } else {
              const { error } = await supabase.auth.signInWithPassword({ email, password });
              if (error) {
                setStatus(`Error: ${friendlyError(error.message)}`);
              } else {
                router.push("/dashboard");
                router.refresh();
                return;
              }
            }
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="meta" htmlFor="email">
          Email (invited members only — no public sign-up)
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className="rounded-xl border-2 border-[var(--foreground)] bg-transparent px-4 py-2.5"
        />
        {mode === "password" && (
          <>
            <label className="meta" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="rounded-xl border-2 border-[var(--foreground)] bg-transparent px-4 py-2.5"
            />
          </>
        )}
        <button type="submit" className="btn w-fit" disabled={busy}>
          {busy ? "Working…" : mode === "magic" ? "Send magic link" : "Sign in"}
        </button>
        {mode === "password" && (
          <button
            type="button"
            className="btn btn-secondary w-fit"
            disabled={busy || !email}
            onClick={async () => {
              setBusy(true);
              try {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                  redirectTo: `${window.location.origin}/auth/confirm?next=/dashboard`,
                });
                setStatus(error ? `Error: ${friendlyError(error.message)}` : "Password reset email sent.");
              } finally {
                setBusy(false);
              }
            }}
          >
            Forgot password? Send reset email
          </button>
        )}
        {linkError && (
          <p className="font-bold text-red-800" role="alert">
            Sign-in link failed: {linkError}. Request a fresh link below.
          </p>
        )}
        {status && (
          <p className="meta" role="status">
            {status}
          </p>
        )}
      </form>
    </div>
  );
}
