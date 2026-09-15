// Haikei-style decorative backgrounds drawn as SVG: layered waves and soft gradient blobs.
// Purely decorative (aria-hidden) and light on the page.

const PALETTE = {
  primary: "#1e2a3a",
  secondary: "#e8e1d3",
  accent: "#b08d57",
  sky: "#a9b8ad",
};

/** Three layered waves, used as a divider between two sections. `fill` is the colour of the section below. */
export function WaveDivider({ fill = "#ffffff", flip = false, className = "" }: { fill?: string; flip?: boolean; className?: string }) {
  return (
    <div className={`pointer-events-none w-full overflow-hidden leading-none ${flip ? "rotate-180" : ""} ${className}`} aria-hidden>
      <svg viewBox="0 0 1440 160" preserveAspectRatio="none" className="block h-16 w-full sm:h-24">
        <path
          d="M0 96 C 160 60 320 40 480 64 C 640 88 800 136 960 128 C 1120 120 1280 64 1440 56 L 1440 160 L 0 160 Z"
          fill={PALETTE.secondary}
          opacity="0.35"
        />
        <path
          d="M0 112 C 180 88 360 72 540 92 C 720 112 900 150 1080 140 C 1260 130 1350 104 1440 96 L 1440 160 L 0 160 Z"
          fill={PALETTE.primary}
          opacity="0.12"
        />
        <path d="M0 128 C 200 112 400 104 600 118 C 800 132 1000 156 1200 150 C 1320 146 1380 138 1440 132 L 1440 160 L 0 160 Z" fill={fill} />
      </svg>
    </div>
  );
}

/** Soft blurred gradient blobs behind a section (like Haikei's "blurry gradient"). */
export function BlobField({ variant = "hero", className = "" }: { variant?: "hero" | "soft" | "corner"; className?: string }) {
  const blobs =
    variant === "hero"
      ? [
          { cx: 260, cy: 180, r: 220, color: PALETTE.secondary, anim: "mk-float" },
          { cx: 980, cy: 120, r: 260, color: PALETTE.sky, anim: "mk-float-slow" },
          { cx: 720, cy: 420, r: 200, color: PALETTE.accent, anim: "mk-float" },
        ]
      : variant === "soft"
        ? [
            { cx: 200, cy: 300, r: 240, color: PALETTE.secondary, anim: "mk-float-slow" },
            { cx: 1180, cy: 220, r: 220, color: PALETTE.sky, anim: "mk-float" },
          ]
        : [{ cx: 1240, cy: 80, r: 260, color: PALETTE.accent, anim: "mk-float-slow" }];

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <svg viewBox="0 0 1440 560" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <defs>
          <filter id={`mk-blur-${variant}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="60" />
          </filter>
        </defs>
        <g filter={`url(#mk-blur-${variant})`}>
          {blobs.map((b, i) => (
            <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill={b.color} opacity={variant === "hero" ? 0.45 : 0.3} className={b.anim} />
          ))}
        </g>
      </svg>
    </div>
  );
}

/** Organic blob shape behind a visual, giving it a soft "stage" to sit on. */
export function BlobShape({ className = "", color = PALETTE.secondary }: { className?: string; color?: string }) {
  const id = `mk-blob-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg viewBox="0 0 600 600" className={`pointer-events-none ${className}`} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={PALETTE.sky} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <path
        d="M421.5 94.5C478 133 527 200 531 272C535 344 494 421 432 468C370 515 287 532 212 512C137 492 70 435 47 364C24 293 45 208 94 150C143 92 220 61 295 58C370 55 365 56 421.5 94.5Z"
        fill={`url(#${id})`}
      />
    </svg>
  );
}
