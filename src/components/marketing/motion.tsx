"use client";

// Small motion building blocks for the website, in the spirit of Motion Primitives:
// scroll reveals, word-by-word headlines, 3D tilt, spotlight, magnetic buttons,
// mouse parallax depth, scroll-driven 3D and count-up numbers.
// All of them respect the visitor's "reduce motion" setting (see MotionProvider).

import {
  animate,
  motion,
  MotionConfig,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/** Thin gradient bar at the top of the page showing scroll progress. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-linear-to-r from-mk-primary to-mk-accent"
      style={{ scaleX }}
    />
  );
}

/** Fades and slides its content in when it scrolls into view. */
export function Reveal({ children, delay = 0, y = 28, className }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Reveals its StaggerItem children one after another. */
export function Stagger({ children, className, gap = 0.09 }: { children: ReactNode; className?: string; gap?: number }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 32, scale: 0.97 },
        show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Headline that rises in word by word. `highlight` words get the brand gradient. */
export function TextReveal({ text, highlight = [], className }: { text: string; highlight?: string[]; className?: string }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <motion.span aria-hidden initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}>
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden pb-[0.14em] align-bottom">
            <motion.span
              className={`inline-block ${
                highlight.includes(word) ? "bg-linear-to-r from-[#8a6a3c] via-mk-accent to-[#7a5c32] bg-clip-text text-transparent" : ""
              }`}
              variants={{ hidden: { y: "105%", opacity: 0 }, show: { y: "0%", opacity: 1, transition: { duration: 0.8, ease: EASE } } }}
            >
              {word}
            </motion.span>
            {i < words.length - 1 && " "}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

/** Card that tilts in 3D towards the mouse. */
export function Tilt({ children, className, max = 8, scale = 1.02 }: { children: ReactNode; className?: string; max?: number; scale?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 180, damping: 18 };
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), spring);
  const s = useSpring(1, spring);

  return (
    <div className={className} style={{ perspective: 1100 }}>
      <motion.div
        ref={ref}
        className="h-full"
        style={{ rotateX, rotateY, scale: s, transformStyle: "preserve-3d" }}
        onPointerMove={(e) => {
          if (reduce || e.pointerType !== "mouse" || !ref.current) return;
          const r = ref.current.getBoundingClientRect();
          px.set((e.clientX - r.left) / r.width);
          py.set((e.clientY - r.top) / r.height);
          s.set(scale);
        }}
        onPointerLeave={() => {
          px.set(0.5);
          py.set(0.5);
          s.set(1);
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/** Soft light that follows the cursor across a card. */
export function Spotlight({ children, className = "", color = "rgba(90, 77, 255, 0.13)" }: { children: ReactNode; className?: string; color?: string }) {
  const mx = useMotionValue(-300);
  const my = useMotionValue(-300);
  const background = useMotionTemplate`radial-gradient(280px circle at ${mx}px ${my}px, ${color}, transparent 72%)`;
  return (
    <div
      className={`group relative overflow-hidden ${className}`}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
    >
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background }} />
      <div className="relative h-full">{children}</div>
    </div>
  );
}

/** Wrapper that gently pulls a button towards the mouse. */
export function Magnetic({ children, strength = 0.22 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(0, { stiffness: 260, damping: 16 });
  const y = useSpring(0, { stiffness: 260, damping: 16 });
  return (
    <motion.div
      ref={ref}
      className="inline-block"
      style={{ x, y }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

const ParallaxContext = createContext<{ x: MotionValue<number>; y: MotionValue<number> } | null>(null);

/** Area that tracks the mouse so ParallaxLayer children move at different depths. */
export function ParallaxScene({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 70, damping: 18 });
  const sy = useSpring(y, { stiffness: 70, damping: 18 });
  return (
    <ParallaxContext.Provider value={{ x: sx, y: sy }}>
      <div
        className={className}
        onPointerMove={(e) => {
          if (reduce || e.pointerType !== "mouse") return;
          const r = e.currentTarget.getBoundingClientRect();
          x.set((e.clientX - r.left) / r.width - 0.5);
          y.set((e.clientY - r.top) / r.height - 0.5);
        }}
        onPointerLeave={() => {
          x.set(0);
          y.set(0);
        }}
      >
        {children}
      </div>
    </ParallaxContext.Provider>
  );
}

/** Moves and slightly rotates with the mouse; bigger depth = closer to the viewer. */
export function ParallaxLayer({ children, depth = 20, className }: { children: ReactNode; depth?: number; className?: string }) {
  const ctx = useContext(ParallaxContext);
  const zero = useMotionValue(0);
  const sourceX = ctx?.x ?? zero;
  const sourceY = ctx?.y ?? zero;
  const x = useTransform(sourceX, (v) => v * depth);
  const y = useTransform(sourceY, (v) => v * depth);
  const rotateY = useTransform(sourceX, (v) => v * depth * 0.35);
  const rotateX = useTransform(sourceY, (v) => -v * depth * 0.35);
  return (
    <motion.div className={className} style={{ x, y, rotateX, rotateY, transformPerspective: 1000 }}>
      {children}
    </motion.div>
  );
}

/** Starts tilted back in 3D and flattens as it scrolls into view. */
export function ScrollTilt({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 30, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : 0.86, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 80, 0]);
  return (
    <div ref={ref} className={`relative ${className}`} style={{ perspective: 1400 }}>
      <motion.div style={{ rotateX, scale, y, transformOrigin: "center top" }}>{children}</motion.div>
    </div>
  );
}

/** Grows from its left edge when scrolled into view (for connector lines). */
export function DrawLine({ className }: { className?: string }) {
  return (
    <motion.div
      aria-hidden
      className={`origin-left ${className ?? ""}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.2, ease: EASE }}
    />
  );
}

/** Number that counts up from 0 when it comes into view. */
export function CountUp({ to, prefix = "", suffix = "", className }: { to: number; prefix?: string; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration: 1.6, ease: EASE, onUpdate: (v) => setValue(Math.round(v)) });
    return () => controls.stop();
  }, [inView, to]);
  return (
    <span ref={ref} className={className}>
      <span className="sr-only">
        {prefix}
        {to}
        {suffix}
      </span>
      <span aria-hidden>
        {prefix}
        {value.toLocaleString("en-PK")}
        {suffix}
      </span>
    </span>
  );
}
