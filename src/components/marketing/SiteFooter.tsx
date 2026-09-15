import { Mail, MapPin, MessageSquareText, Phone } from "lucide-react";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { LEGAL_DOCS } from "@/lib/legal";
import { currentYear, INDUSTRIES, SITE } from "@/lib/marketing";

export default function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-mk-secondary/50 bg-linear-to-b from-mk-background to-stone-50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-mk-primary to-mk-accent text-white">
              <MessageSquareText className="h-[18px] w-[18px]" aria-hidden />
            </span>
            {BRAND.name}
          </Link>
          <p className="max-w-xs text-sm leading-6 text-slate-600">
            AI chat assistants that answer your customers 24/7 in English, Urdu and Roman Urdu, and turn conversations into leads.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Product</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {[
              { href: "/features", label: "Features" },
              { href: "/pricing", label: "Pricing" },
              { href: "/industries", label: "Industries" },
              { href: "/about", label: "About us" },
              { href: "/contact", label: "Book a demo" },
              { href: "/login", label: "Log in" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-slate-900">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Industries</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {INDUSTRIES.map((i) => (
              <li key={i.slug}>
                <Link href={`/industries/${i.slug}`} className="hover:text-slate-900">
                  {i.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>
              <a href={`mailto:${SITE.contact.email}`} className="flex items-center gap-2 hover:text-slate-900">
                <Mail className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                {SITE.contact.email}
              </a>
            </li>
            {SITE.contact.phones.map((phone) => (
              <li key={phone}>
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="flex items-center gap-2 hover:text-slate-900">
                  <Phone className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                  {phone}
                </a>
              </li>
            ))}
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              {SITE.contact.location}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-sm text-slate-500 sm:px-6">
          <p>
            © {currentYear()} {SITE.company}. All rights reserved.
          </p>
          <nav aria-label="Legal">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {LEGAL_DOCS.map((d) => (
                <li key={d.path}>
                  <Link href={d.path} className="hover:text-slate-900">
                    {d.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
