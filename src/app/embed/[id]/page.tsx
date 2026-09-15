import { notFound } from "next/navigation";
import ChatWindow from "@/components/ChatWindow";
import { getBot } from "@/lib/db";

// The chat page loaded inside the website widget (and shareable as a direct link,
// e.g. in an Instagram bio or WhatsApp status).
export default async function EmbedPage({ params, searchParams }: PageProps<"/embed/[id]">) {
  const { id } = await params;
  const { page, widget } = await searchParams;
  const bot = await getBot(id);
  if (!bot) notFound();

  const inWidget = widget === "1";
  return (
    <main className={inWidget ? "h-dvh" : "flex h-dvh items-center justify-center bg-slate-200 sm:p-6"}>
      <div className={inWidget ? "h-full" : "h-full w-full overflow-hidden sm:h-[680px] sm:max-w-md sm:rounded-2xl sm:shadow-xl"}>
        <ChatWindow
          botId={bot.id}
          businessName={bot.businessName}
          color={bot.color}
          welcome={bot.welcome}
          persist
          embedded={inWidget}
          pageUrl={typeof page === "string" ? page : "direct-link"}
        />
      </div>
    </main>
  );
}
