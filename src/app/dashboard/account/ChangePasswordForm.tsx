"use client";

import { KeyRound } from "lucide-react";
import { useState } from "react";

const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/admin/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      setCurrentPassword("");
      setNewPassword("");
      setMessage({ type: "ok", text: "Password changed. Other devices have been logged out." });
    } else {
      setMessage({ type: "error", text: data.error ?? "Could not change the password" });
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="font-semibold">Change password</h2>
      <input
        type="password"
        autoComplete="current-password"
        className={inputClass}
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        placeholder="Current password"
      />
      <input
        type="password"
        autoComplete="new-password"
        className={inputClass}
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="New password (at least 8 characters)"
      />
      {message && <p className={message.type === "ok" ? "text-sm text-emerald-700" : "text-sm text-red-600"}>{message.text}</p>}
      <button
        disabled={busy || !currentPassword || newPassword.length < 8}
        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        <KeyRound className="h-4 w-4" aria-hidden />
        {busy ? "Saving..." : "Change password"}
      </button>
    </form>
  );
}
