"use client";

import { ArrowRight, CircleAlert, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthField, { authButton } from "@/components/auth/AuthField";

export default function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      router.push(next);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not log in");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <AuthField label="Email" icon={Mail} autoFocus autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" />
      <div>
        <AuthField
          label="Password"
          icon={Lock}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
        />
        <div className="mt-2 text-right">
          <Link href="/forgot-password" className="text-sm font-medium text-mk-primary hover:underline">
            Forgot password?
          </Link>
        </div>
      </div>
      {error && (
        <p className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700" role="alert">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}
      <button disabled={loading || !email || !password} className={authButton}>
        {loading ? "Checking..." : "Log in"}
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
      </button>
    </form>
  );
}
