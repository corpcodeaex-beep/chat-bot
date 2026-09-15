"use client";

import { ArrowRight, CircleCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Props {
  industries: { slug: string; name: string }[];
  plans: { key: string; label: string }[];
  defaultPlan: string;
  defaultIndustry: string;
}

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-mk-text outline-none transition placeholder:text-slate-400 focus:border-mk-primary focus:ring-4 focus:ring-mk-secondary/50";

export default function ContactForm({ industries, plans, defaultPlan, defaultIndustry }: Props) {
  const [form, setForm] = useState({
    name: "",
    business: "",
    email: "",
    phone: "",
    industry: defaultIndustry,
    plan: defaultPlan,
    message: "",
    website: "", // hidden field that only bots fill in
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setStatus("sent");
    } else {
      setStatus("idle");
      setError((await res.json().catch(() => ({}))).error ?? "Something went wrong. Please try again.");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center justify-center rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-2xl shadow-slate-900/10">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CircleCheck className="h-7 w-7" aria-hidden />
        </span>
        <h2 className="mt-5 text-2xl font-semibold text-slate-900">Thank you, {form.name.split(" ")[0]}!</h2>
        <p className="mt-3 max-w-sm text-slate-600">
          We&apos;ve received your request and will contact you shortly to set up your free demo assistant.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-[2rem] border border-white bg-white/90 p-7 shadow-2xl shadow-slate-900/15 ring-1 ring-mk-secondary/60 backdrop-blur sm:p-9">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Your name *</span>
          <input required autoComplete="name" value={form.name} onChange={set("name")} className={inputClass} placeholder="Ayesha Khan" />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Business name</span>
          <input autoComplete="organization" value={form.business} onChange={set("business")} className={inputClass} placeholder="Smile Dental Clinic" />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Email *</span>
          <input required type="email" autoComplete="email" value={form.email} onChange={set("email")} className={inputClass} placeholder="you@business.com" />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Phone / WhatsApp</span>
          <input type="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} className={inputClass} placeholder="0300-1234567" />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Industry</span>
          <select value={form.industry} onChange={set("industry")} className={inputClass}>
            <option value="">Select your industry</option>
            {industries.map((i) => (
              <option key={i.slug} value={i.slug}>
                {i.name}
              </option>
            ))}
            <option value="other">Other</option>
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Interested plan</span>
          <select value={form.plan} onChange={set("plan")} className={inputClass}>
            <option value="">Not sure yet</option>
            {plans.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">What should your assistant help with?</span>
        <textarea
          rows={4}
          value={form.message}
          onChange={set("message")}
          className={inputClass}
          placeholder="e.g. answer fee questions and collect appointment requests, our website is ..."
        />
      </label>
      <div className="absolute -left-[9999px]" aria-hidden>
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} />
        </label>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        disabled={status === "sending"}
        className="group flex w-full items-center justify-center gap-2 rounded-full bg-mk-primary py-3.5 font-semibold text-white shadow-xl shadow-mk-primary/30 transition hover:bg-mk-primary-dark disabled:opacity-60"
      >
        {status === "sending" ? "Sending..." : "Request my free demo"}
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
      </button>
      <p className="text-center text-xs text-slate-500">
        We&apos;ll only use your details to contact you about your demo. See our{" "}
        <Link href="/privacy-policy" className="underline hover:text-mk-text">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
