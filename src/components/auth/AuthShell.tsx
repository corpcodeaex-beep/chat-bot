import { BarChart3, Languages, MessageSquareText, UserPlus } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import ChatDemo from "@/components/marketing/ChatDemo";
import { MotionProvider, ParallaxLayer, ParallaxScene, Tilt } from "@/components/marketing/motion";
import { BRAND } from "@/lib/brand";
import { HERO_CHAT } from "@/lib/marketing";

/** Split-screen frame for login and password pages: animated brand panel on the left, form card on the right. */
export default function AuthShell({ title, text, icon, children }: { title: string; text?: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <MotionProvider>
      <main className="grid w-full flex-1 grid-cols-1 bg-mk-background text-mk-text lg:h-dvh lg:max-h-dvh lg:grid-cols-[1.05fr_1fr] lg:overflow-hidden">
        <ParallaxScene className="relative hidden overflow-hidden bg-linear-to-br from-mk-primary-dark via-mk-primary to-[#2c3b50] lg:block">
          <div className="mk-grid absolute inset-0 opacity-20" aria-hidden />

          <div className="relative flex h-full flex-col justify-between gap-6 px-10 py-8 xl:px-14">
            <Link href="/" className="flex w-fit items-center gap-2 text-lg font-semibold text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30 backdrop-blur">
                <MessageSquareText className="h-5 w-5" aria-hidden />
              </span>
              {BRAND.name}
            </Link>

            <div className="relative mx-auto w-full max-w-sm">
              <ParallaxLayer depth={18}>
                <Tilt max={8} scale={1}>
                  <div className="mk-float">
                    <ChatDemo {...HERO_CHAT} color="#1e2a3a" bodyClassName="h-[220px] [@media(min-height:860px)]:h-[300px]" />
                  </div>
                </Tilt>
              </ParallaxLayer>
              <ParallaxLayer depth={44} className="absolute -left-14 top-10 hidden xl:block">
                <div className="mk-float-slow flex items-center gap-2 rounded-2xl bg-white/90 px-3 py-2 text-sm font-medium shadow-xl shadow-slate-950/20 backdrop-blur">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <UserPlus className="h-4 w-4" aria-hidden />
                  </span>
                  New lead captured
                </div>
              </ParallaxLayer>
              <ParallaxLayer depth={58} className="absolute -right-12 bottom-16 hidden xl:block">
                <div className="mk-float flex items-center gap-2 rounded-2xl bg-white/90 px-3 py-2 text-sm font-medium shadow-xl shadow-slate-950/20 backdrop-blur">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mk-secondary/60 text-mk-primary">
                    <Languages className="h-4 w-4" aria-hidden />
                  </span>
                  Replied in Roman Urdu
                </div>
              </ParallaxLayer>
            </div>

            <div className="text-white">
              <p className="max-w-md text-2xl font-semibold leading-snug">Every chat, lead and answer from your assistants, in one place.</p>
              <ul className="mt-5 flex flex-wrap gap-2 text-sm">
                {[
                  { icon: UserPlus, text: "Leads" },
                  { icon: MessageSquareText, text: "Chats" },
                  { icon: BarChart3, text: "Activity" },
                ].map((item) => (
                  <li key={item.text} className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 ring-1 ring-white/25 backdrop-blur">
                    <item.icon className="h-4 w-4" aria-hidden />
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ParallaxScene>

        <div className="relative flex items-center justify-center px-4 py-10 sm:px-8 lg:overflow-y-auto">
          <div className="mk-fade-up relative w-full max-w-md">
            <Link href="/" className="mb-8 flex w-fit items-center gap-2 text-lg font-semibold lg:hidden">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-mk-primary to-mk-accent text-white shadow-md shadow-mk-primary/30">
                <MessageSquareText className="h-5 w-5" aria-hidden />
              </span>
              {BRAND.name}
            </Link>
            <div className="rounded-[2rem] border border-white bg-white/85 p-7 shadow-2xl shadow-slate-900/10 ring-1 ring-mk-secondary/50 backdrop-blur sm:p-9">
              {icon && (
                <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-mk-primary to-[#34465e] text-white shadow-lg shadow-mk-primary/30">
                  {icon}
                </span>
              )}
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
              {text && <p className="mt-2 text-mk-muted">{text}</p>}
              <div className="mt-7">{children}</div>
            </div>
            <p className="mt-6 text-center text-sm text-mk-muted">
              New to {BRAND.name}?{" "}
              <Link href="/contact" className="font-semibold text-mk-primary hover:underline">
                Book a free demo
              </Link>
            </p>
            <p className="mt-3 flex justify-center gap-4 text-xs text-mk-muted">
              <Link href="/terms" className="hover:text-mk-text">
                Terms
              </Link>
              <Link href="/privacy-policy" className="hover:text-mk-text">
                Privacy
              </Link>
            </p>
          </div>
        </div>
      </main>
    </MotionProvider>
  );
}
