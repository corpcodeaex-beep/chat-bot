import { ArrowLeft, Compass, MessageSquareText } from "lucide-react";
import Link from "next/link";
import { BRAND } from "@/lib/brand";

export default function NotFound() {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-mk-background px-4 py-24 text-mk-text">
      <div className="mk-grid absolute inset-0 opacity-60" style={{ maskImage: "radial-gradient(ellipse 60% 60% at 50% 40%, black, transparent)" }} aria-hidden />
      <div className="mk-fade-up relative max-w-lg text-center">
        <Link href="/" className="mx-auto flex w-fit items-center gap-2 text-lg font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mk-primary text-white">
            <MessageSquareText className="h-5 w-5" aria-hidden />
          </span>
          {BRAND.name}
        </Link>
        <p className="mt-12 bg-linear-to-b from-mk-primary to-mk-accent bg-clip-text text-8xl font-semibold tracking-tight text-transparent">404</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">This page could not be found</h1>
        <p className="mt-3 text-mk-muted">The link may be old, or the page may have moved.</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/" className="group inline-flex items-center gap-2 rounded-full bg-mk-primary px-6 py-3 font-semibold text-white shadow-xl shadow-mk-primary/25 transition hover:bg-mk-primary-dark">
            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" aria-hidden />
            Back to home
          </Link>
          <Link href="/features" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold transition hover:border-mk-accent">
            <Compass className="h-4 w-4 text-mk-accent" aria-hidden />
            Explore features
          </Link>
        </div>
      </div>
    </main>
  );
}
