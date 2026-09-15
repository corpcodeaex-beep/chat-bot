import { Bot, Gauge, Inbox, KeyRound, MessageSquareText, Plus, Users } from "lucide-react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import NotificationBell from "@/components/NotificationBell";
import { providerStatus } from "@/lib/ai";
import { getAlerts } from "@/lib/alerts";
import { BRAND } from "@/lib/brand";
import { pageViewer } from "@/lib/session";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const viewer = await pageViewer();
  const isAdmin = viewer.role === "admin";
  const provider = isAdmin ? providerStatus() : null;
  const alerts = await getAlerts(viewer);
  const links = isAdmin
    ? [
        { href: "/dashboard", label: "Overview", icon: Gauge },
        { href: "/dashboard/companies", label: "Companies", icon: Users },
        { href: "/dashboard/inquiries", label: "Inquiries", icon: Inbox },
        { href: "/dashboard/bots", label: "All bots", icon: Bot },
        { href: "/dashboard/new", label: "New bot", icon: Plus },
        { href: "/dashboard/account", label: "Account", icon: KeyRound },
      ]
    : [
        { href: "/dashboard", label: "My assistants", icon: MessageSquareText },
        { href: "/dashboard/new", label: "New assistant", icon: Plus },
        { href: "/dashboard/account", label: "Account", icon: KeyRound },
      ];

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <MessageSquareText className="h-[18px] w-[18px]" aria-hidden />
            </span>
            {BRAND.name}
          </Link>
          <nav className="ml-4 flex flex-wrap gap-1 text-sm">
            {links.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="flex items-center gap-1.5 rounded-md px-3 py-1.5 hover:bg-slate-100">
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            {provider && (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  provider.active === "demo" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                }`}
                title={provider.model}
              >
                AI: {provider.label}
              </span>
            )}
            <NotificationBell alerts={alerts} />
            <span className="hidden text-sm text-slate-500 sm:inline">{viewer.name}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</div>
    </div>
  );
}
