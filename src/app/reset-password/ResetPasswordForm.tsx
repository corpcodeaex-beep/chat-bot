"use client";

import { CircleCheck, KeyRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const inputClass = "w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) return setError("The two passwords don't match.");
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setLoading(false);
    if (res.ok) setDone(true);
    else setError((await res.json().catch(() => ({}))).error ?? "Could not change the password.");
  }

  if (done) {
    return (
      <div className="space-y-3">
        <p className="flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
          <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Your password was changed. Other devices were signed out.
        </p>
        <Link href="/login" className="inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Log in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <input
        type="password"
        autoFocus
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password (at least 8 characters)"
        className={inputClass}
      />
      <input
        type="password"
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Type it again"
        className={inputClass}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        disabled={loading || password.length < 8 || !confirm}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        <KeyRound className="h-4 w-4" aria-hidden />
        {loading ? "Saving..." : "Save new password"}
      </button>
    </form>
  );
}
