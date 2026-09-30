"use client";

import { useState } from "react";

export default function InviteForm() {
  const [email, setEmail] = useState("");
  const [memberSlug, setMemberSlug] = useState("member-1");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="hero flex max-w-md flex-col gap-4"
      aria-label="Invite a member"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setStatus("Sending invite…");
        try {
          const res = await fetch("/api/admin/invite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, memberSlug }),
          });
          if (res.status === 503) {
            setStatus("Demo mode — connect Supabase to send real invites.");
            return;
          }
          const body = await res.json().catch(() => ({}));
          setStatus(res.ok ? `Invite sent to ${email}.` : `Error: ${body.error ?? "failed"}`);
        } finally {
          setBusy(false);
        }
      }}
    >
      <label className="meta" htmlFor="invite-email">Member email</label>
      <input
        id="invite-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-xl border-2 border-[var(--foreground)] bg-transparent px-4 py-2"
      />
      <label className="meta" htmlFor="invite-slot">Member slot</label>
      <select
        id="invite-slot"
        value={memberSlug}
        onChange={(e) => setMemberSlug(e.target.value)}
        className="rounded-xl border px-3 py-2"
      >
        {(["member-1", "member-2", "member-3", "member-4"] as const).map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      <button type="submit" className="btn w-fit" disabled={busy}>
        {busy ? "Working…" : "Send invite"}
      </button>
      {status && <p className="meta" role="status">{status}</p>}
    </form>
  );
}
