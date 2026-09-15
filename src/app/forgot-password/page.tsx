"use client";

import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BRAND } from "@/lib/brand";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (res.ok) setSent(true);
    else setError((await res.json().catch(() => ({}))).error ?? "Something went wrong. Please try again.");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div>
          <h1 className="text-xl font-semibold">Forgot your password?</h1>
          <p className="mt-1 text-sm text-slate-500">Enter your company login email and we&apos;ll send you a link to choose a new password.</p>
        </div>
        {sent ? (
          <p className="flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
            <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            If {BRAND.name} has an account for {email}, a reset link is on its way. It works for 1 hour. Check your spam folder too. If nothing
            arrives, contact your provider.
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <input
              type="email"
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              disabled={loading || !email}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <Mail className="h-4 w-4" aria-hidden />
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}
        <Link href="/login" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to log in
        </Link>
      </div>
    </main>
  );
}
