import type { ReactNode } from "react";
import { BlobField, WaveDivider } from "./Backgrounds";
import { Reveal, TextReveal } from "./motion";

/** Top section for inner pages: blob background, word-by-word headline and a wave into the next section. */
export default function PageHero({
  eyebrow,
  title,
  highlight = [],
  text,
  children,
  waveFill = "#ffffff",
}: {
  eyebrow: string;
  title: string;
  highlight?: string[];
  text?: string;
  children?: ReactNode;
  waveFill?: string;
}) {
  return (
    <section className="relative overflow-hidden">
      <BlobField variant="hero" />
      <div className="mk-grid absolute inset-0" style={{ maskImage: "radial-gradient(ellipse 70% 70% at 50% 0%, black, transparent)" }} aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-16 text-center sm:px-6 lg:pt-24">
        <Reveal y={12}>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-mk-primary shadow-sm ring-1 ring-mk-secondary backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-mk-accent" aria-hidden />
            {eyebrow}
          </p>
        </Reveal>
        <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-semibold leading-[1.08] tracking-tight text-mk-text sm:text-6xl">
          <TextReveal text={title} highlight={highlight} />
        </h1>
        {text && (
          <Reveal delay={0.3}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-mk-muted">{text}</p>
          </Reveal>
        )}
        {children && (
          <Reveal delay={0.45} className="mt-9">
            {children}
          </Reveal>
        )}
      </div>
      <WaveDivider fill={waveFill} />
    </section>
  );
}
