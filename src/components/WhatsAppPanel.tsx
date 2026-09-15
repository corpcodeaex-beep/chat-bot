"use client";

import { Check, ChevronRight, CircleCheck, CirclePause, Copy, Lock, MessageCircle, Save, TriangleAlert, Unplug } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDate } from "@/lib/format";
import type { WhatsAppAccount } from "@/lib/whatsapp";

export interface WhatsAppInfo {
  account: WhatsAppAccount | null;
  planAllows: boolean;
  planLabel: string;
  webhookUrl: string;
  /** Only sent to the admin. */
  verifyToken?: string;
  appSecretSet: boolean;
  dryRun: boolean;
}

const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500";

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

export default function WhatsAppPanel({ botId, isAdmin, info }: { botId: string; isAdmin: boolean; info: WhatsAppInfo }) {
  const router = useRouter();
  const { account } = info;
  const [phoneNumberId, setPhoneNumberId] = useState(account?.phoneNumberId ?? "");
  const [displayPhone, setDisplayPhone] = useState(account?.displayPhone ?? "");
  const [accessToken, setAccessToken] = useState("");
  const [enabled, setEnabled] = useState(account?.enabled ?? true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [copied, setCopied] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch(`/api/admin/bots/${botId}/whatsapp`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumberId, displayPhone, accessToken, enabled }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      setAccessToken("");
      setMessage({ type: "ok", text: "Saved" });
      router.refresh();
    } else {
      setMessage({ type: "error", text: data.error ?? "Could not save" });
    }
  }

  async function disconnect() {
    if (!confirm("Disconnect WhatsApp from this bot? Customers messaging this number will no longer get replies.")) return;
    setBusy(true);
    await fetch(`/api/admin/bots/${botId}/whatsapp`, { method: "DELETE" });
    setBusy(false);
    setPhoneNumberId("");
    setDisplayPhone("");
    setMessage(null);
    router.refresh();
  }

  async function copy(text: string, which: string) {
    await navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(""), 2000);
  }

  const status = !account
    ? { icon: MessageCircle, text: "Not connected", tone: "text-slate-600" }
    : account.enabled
      ? { icon: CircleCheck, text: `Connected${account.displayPhone ? `: ${account.displayPhone}` : ""}`, tone: "text-emerald-700" }
      : { icon: CirclePause, text: "Connected but turned off", tone: "text-slate-600" };
  const StatusIcon = status.icon;

  if (!info.planAllows && !isAdmin) {
    return (
      <section className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <Lock className="h-6 w-6" aria-hidden />
        </span>
        <h2 className="font-semibold">WhatsApp is not included in the {info.planLabel} plan</h2>
        <p className="max-w-md text-sm text-slate-600">
          Let customers chat with this assistant on WhatsApp, with the same knowledge and lead capture as your website. Available on
          the Pro and Enterprise plans. Contact your provider to upgrade.
        </p>
      </section>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold">WhatsApp status</h2>
        <p className={`flex items-center gap-2 text-lg font-medium ${status.tone}`}>
          <StatusIcon className="h-5 w-5" aria-hidden />
          {status.text}
        </p>
        {account?.lastMessageAt && <p className="text-sm text-slate-500">Last message handled {formatDate(account.lastMessageAt)}</p>}
        {account?.lastError && (
          <p className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {account.lastError}
          </p>
        )}
        {!info.planAllows && (
          <p className="flex items-start gap-2 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
            <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>
              Locked: the {info.planLabel} plan does not include WhatsApp. Change the company&apos;s plan to Pro or Enterprise to turn it on.
            </span>
          </p>
        )}
        {isAdmin && !info.appSecretSet && (
          <Warning>
            <code>WHATSAPP_APP_SECRET</code> is not set in <code>.env.local</code>, so incoming WhatsApp messages are rejected.
          </Warning>
        )}
        {isAdmin && info.dryRun && (
          <Warning>
            <code>WHATSAPP_DRY_RUN=true</code>: replies are written to the server log instead of being sent. Set it to false when
            going live.
          </Warning>
        )}
        {isAdmin && info.webhookUrl.includes("localhost") && (
          <Warning>Meta cannot reach localhost. The webhook starts working once the app is deployed online.</Warning>
        )}
        <p className="text-sm text-slate-600">
          When connected, customers message the business&apos;s WhatsApp number and the assistant replies using the same knowledge,
          instructions and lead capture as the website chat. Every WhatsApp chat is saved as a lead with the customer&apos;s number.
        </p>
      </section>

      {isAdmin ? (
        <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5">
          <div>
            <h2 className="font-semibold">Connect a WhatsApp number</h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600">
              <li>
                In{" "}
                <a href="https://developers.facebook.com/apps" target="_blank" rel="noreferrer" className="text-indigo-700 underline">
                  Meta for Developers
                </a>
                , create a Business app and add the WhatsApp product.
              </li>
              <li>
                Under WhatsApp <ChevronRight className="inline h-3.5 w-3.5 align-[-2px]" aria-label="then" /> Configuration, set the webhook below and
                subscribe to the &quot;messages&quot; field.
              </li>
              <li>Add the business phone number and copy its Phone number ID.</li>
              <li>Create a permanent access token (System User with whatsapp_business_messaging permission).</li>
              <li>
                Copy the App Secret (App settings <ChevronRight className="inline h-3.5 w-3.5 align-[-2px]" aria-label="then" /> Basic) into <code>WHATSAPP_APP_SECRET</code> in <code>.env.local</code>.
              </li>
            </ol>
          </div>

          <div className="space-y-2 text-sm">
            {[
              { label: "Callback URL", value: info.webhookUrl, key: "url" },
              { label: "Verify token", value: info.verifyToken || "Set WHATSAPP_VERIFY_TOKEN in .env.local", key: "token" },
            ].map((row) => (
              <div key={row.key} className="flex items-center gap-2">
                <span className="w-24 shrink-0 text-slate-500">{row.label}</span>
                <code className="min-w-0 flex-1 truncate rounded bg-slate-100 px-2 py-1">{row.value}</code>
                <button
                  type="button"
                  onClick={() => copy(row.value, row.key)}
                  className="rounded-md border border-slate-300 p-1.5 hover:bg-slate-50"
                  aria-label={`Copy ${row.label}`}
                >
                  {copied === row.key ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={save} className="space-y-3">
            <label className="block space-y-1">
              <span className="text-sm font-medium">Phone number ID</span>
              <input className={inputClass} value={phoneNumberId} onChange={(e) => setPhoneNumberId(e.target.value)} placeholder="e.g. 106540352242922" />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">Display phone number</span>
              <input className={inputClass} value={displayPhone} onChange={(e) => setDisplayPhone(e.target.value)} placeholder="+92 300 1234567" />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">Access token</span>
              <input
                type="password"
                autoComplete="off"
                className={inputClass}
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder={account ? "Saved (leave empty to keep it)" : "Paste the permanent access token"}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
              Reply to WhatsApp messages
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <button
                disabled={busy || !phoneNumberId}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" aria-hidden />
                {busy ? "Saving..." : "Save"}
              </button>
              {account && (
                <button
                  type="button"
                  onClick={disconnect}
                  disabled={busy}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <Unplug className="h-4 w-4" aria-hidden />
                  Disconnect
                </button>
              )}
              {message && <span className={message.type === "ok" ? "text-sm text-emerald-700" : "text-sm text-red-600"}>{message.text}</span>}
            </div>
          </form>
        </section>
      ) : (
        <section className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          <h2 className="mb-2 font-semibold text-slate-900">Setup</h2>
          Your WhatsApp connection is set up and managed by your provider. Contact them to connect or change your number.
        </section>
      )}
    </div>
  );
}
