export default function SectionHeading({
  eyebrow,
  title,
  text,
  align = "center",
  dark = false,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  align?: "center" | "left";
  dark?: boolean;
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <p
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
            dark ? "bg-white/10 text-slate-200" : "bg-mk-secondary/40 text-mk-primary"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${dark ? "bg-slate-300" : "bg-mk-accent"}`} aria-hidden />
          {eyebrow}
        </p>
      )}
      <h2 className={`mt-4 text-3xl font-semibold tracking-tight sm:text-5xl ${dark ? "text-white" : "text-mk-text"}`}>{title}</h2>
      {text && <p className={`mt-5 text-lg leading-8 ${dark ? "text-slate-300" : "text-mk-muted"}`}>{text}</p>}
    </div>
  );
}
