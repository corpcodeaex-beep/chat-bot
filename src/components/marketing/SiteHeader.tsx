"use client";

import { Menu, MessageSquareText, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BRAND } from "@/lib/brand";

const NAV = [
  { href: "/features", label: "Features" },
  { href: "/industries", label: "Industries" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-mk-primary to-mk-accent text-white shadow-md shadow-mk-primary/30">
            <MessageSquareText className="h-[18px] w-[18px]" aria-hidden />
          </span>
          {BRAND.name}
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-2 text-sm transition ${
                isActive(item.href) ? "bg-mk-secondary/40 font-medium text-mk-text" : "text-mk-muted hover:text-mk-text"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login" className="rounded-full px-4 py-2 text-sm text-slate-600 hover:text-slate-900">
            Log in
          </Link>
          <Link
            href="/contact"
            className="rounded-full bg-mk-primary px-4 py-2 text-sm font-medium text-white shadow-md shadow-mk-primary/30 transition hover:bg-mk-primary-dark"
          >
            Book a demo
          </Link>
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
        >
          {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 pb-5 pt-2 md:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-3 ${isActive(item.href) ? "bg-slate-100 font-medium text-slate-900" : "text-slate-700"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link href="/login" onClick={() => setOpen(false)} className="rounded-full border border-slate-300 py-2.5 text-center text-sm font-medium text-slate-800">
              Log in
            </Link>
            <Link href="/contact" onClick={() => setOpen(false)} className="rounded-full bg-slate-900 py-2.5 text-center text-sm font-medium text-white">
              Book a demo
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
