"use client";

import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { useState, type InputHTMLAttributes } from "react";

/** Labelled input with a leading icon; password fields get a show/hide toggle. */
export default function AuthField({ label, icon: Icon, type = "text", ...props }: { label: string; icon: LucideIcon } & InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-mk-text">{label}</span>
      <span className="group relative block">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 transition group-focus-within:text-mk-primary" aria-hidden />
        <input
          {...props}
          type={isPassword && show ? "text" : type}
          className={`w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 text-mk-text outline-none transition placeholder:text-slate-400 focus:border-mk-primary focus:ring-4 focus:ring-mk-secondary/50 ${isPassword ? "pr-11" : "pr-4"}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-mk-text"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
          </button>
        )}
      </span>
    </label>
  );
}

export const authButton =
  "group flex w-full items-center justify-center gap-2 rounded-full bg-mk-primary py-3.5 font-semibold text-white shadow-xl shadow-mk-primary/30 transition hover:bg-mk-primary-dark disabled:cursor-not-allowed disabled:opacity-50";
