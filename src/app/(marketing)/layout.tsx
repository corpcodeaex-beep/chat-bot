import Script from "next/script";
import SiteFooter from "@/components/marketing/SiteFooter";
import SiteHeader from "@/components/marketing/SiteHeader";
import { MotionProvider, ScrollProgress } from "@/components/marketing/motion";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  // Your own assistant as the chat bubble on the website (set SITE_BOT_ID to a bot's ID).
  const siteBotId = process.env.SITE_BOT_ID;
  return (
    <MotionProvider>
      <div className="flex min-h-full flex-1 flex-col bg-mk-background text-mk-text">
        <ScrollProgress />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        {siteBotId && <Script src="/widget.js" data-bot={siteBotId} strategy="afterInteractive" />}
      </div>
    </MotionProvider>
  );
}
