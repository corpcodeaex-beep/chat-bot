"use client";

import { ArrowLeft, CircleAlert, Mail, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import AuthField, { authButton } from "@/components/auth/AuthField";
import { BRAND } from "@/lib/brand";

export default function ForgotPasswordForm() {
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
    <div className="space-y-6">
      {sent ? (
        <p className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
          <Mail className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          If {BRAND.name} has an account for {email}, a reset link is on its way. It works for 1 hour. Check your spam folder too. If nothing arrives,
          contact your provider.
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <AuthField label="Email" icon={Mail} type="email" autoFocus autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" />
          {error && (
            <p className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700" role="alert">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {error}
            </p>
          )}
          <button disabled={loading || !email} className={authButton}>
            <Send className="h-4 w-4" aria-hidden />
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}
      <Link href="/login" className="group inline-flex items-center gap-1.5 text-sm font-medium text-mk-muted hover:text-mk-primary">
        <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" aria-hidden />
        Back to log in
      </Link>
    </div>
  );
}
