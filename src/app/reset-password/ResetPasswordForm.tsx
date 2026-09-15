"use client";

import { ArrowRight, CircleAlert, CircleCheck, KeyRound, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import AuthField, { authButton } from "@/components/auth/AuthField";

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
      <div className="space-y-5">
        <p className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
          <CircleCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          Your password was changed. Other devices were signed out.
        </p>
        <Link href="/login" className={authButton}>
          Log in
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
        </Link>
      </div>
    );
  }

  const strength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3;

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <AuthField
          label="New password"
          icon={Lock}
          type="password"
          autoFocus
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
        />
        <div className="mt-2 flex gap-1.5" aria-hidden>
          {[1, 2, 3].map((step) => (
            <span
              key={step}
              className={`h-1.5 flex-1 rounded-full transition ${
                strength >= step ? (strength === 1 ? "bg-rose-400" : strength === 2 ? "bg-amber-400" : "bg-emerald-500") : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>
      <AuthField
        label="Confirm password"
        icon={KeyRound}
        type="password"
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Type it again"
      />
      {error && (
        <p className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700" role="alert">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}
      <button disabled={loading || password.length < 8 || !confirm} className={authButton}>
        <KeyRound className="h-4 w-4" aria-hidden />
        {loading ? "Saving..." : "Save new password"}
      </button>
    </form>
  );
}
