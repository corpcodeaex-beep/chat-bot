import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { BlobShape } from "./Backgrounds";
import { Magnetic, Reveal } from "./motion";

export default function CtaBanner({
  title = "Your next customer is messaging right now",
  text = "Get an AI assistant trained on your business, answering in Urdu, Roman Urdu and English, and sending you every lead.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="px-4 py-20 sm:px-6">
      <Reveal className="relative mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-mk-primary-dark via-mk-primary to-[#2c3b50] px-6 py-20 text-center shadow-2xl shadow-mk-primary/30 sm:px-16">
          <BlobShape className="mk-float-slow absolute -left-24 -top-32 h-96 w-96 opacity-30" color="#5b7a99" />
          <BlobShape className="mk-float absolute -bottom-40 -right-20 h-[28rem] w-[28rem] opacity-25" color="#a9b8ad" />
          <div className="mk-grid absolute inset-0 opacity-20 invert" aria-hidden />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">{title}</h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-white/85">{text}</p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Magnetic>
                <Link
                  href="/contact"
                  className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-mk-text shadow-xl transition hover:bg-slate-50"
                >
                  Book a free demo
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
                </Link>
              </Magnetic>
              <Magnetic>
                <Link href="/pricing" className="inline-flex items-center rounded-full border border-white/50 px-7 py-3.5 font-semibold text-white transition hover:bg-white/10">
                  See pricing
                </Link>
              </Magnetic>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
