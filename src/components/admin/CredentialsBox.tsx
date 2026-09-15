"use client";

import { Check, Copy, X } from "lucide-react";
import { useState } from "react";

export interface Credentials {
  title: string;
  email: string;
  password: string;
}

/** Shows login details once so the admin can send them to the company. */
export default function CredentialsBox({ credentials, loginUrl, onClose }: { credentials: Credentials; loginUrl: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const text = `Login: ${loginUrl}\nEmail: ${credentials.email}\nPassword: ${credentials.password}`;

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-emerald-900">{credentials.title}</h2>
          <p className="text-sm text-emerald-800">Send these to the company. The password is shown only this once.</p>
        </div>
        <button onClick={onClose} aria-label="Close" className="rounded p-1 text-emerald-900 hover:bg-emerald-100">
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <pre className="overflow-x-auto rounded-lg bg-white p-3 text-sm">{text}</pre>
      <button onClick={copy} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700">
        {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
        {copied ? "Copied" : "Copy login details"}
      </button>
    </div>
  );
}
