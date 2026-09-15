"use client";

import { LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BRAND } from "@/lib/brand";

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

  const input = "w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500";

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div>
          <h1 className="text-xl font-semibold">{BRAND.name}</h1>
          <p className="mt-1 text-sm text-slate-500">Log in to manage your chat assistants.</p>
        </div>
        <input
          autoFocus
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className={input}
        />
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className={input}
        />
        <div className="-mt-2 text-right">
          <Link href="/forgot-password" className="text-xs text-indigo-700 hover:underline">
            Forgot password?
          </Link>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={loading || !email || !password}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          <LogIn className="h-4 w-4" aria-hidden />
          {loading ? "Checking..." : "Log in"}
        </button>
      </form>
    </main>
  );
}
