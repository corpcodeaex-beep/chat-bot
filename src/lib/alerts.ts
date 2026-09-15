import { getPlatformOverview, type AttentionKind } from "./admin-stats";
import { providerStatus } from "./ai";
import { getRecentAiFailure } from "./ai/failures";
import { getClient } from "./clients";
import { getStats } from "./db";
import { emailConfigured } from "./email";
import { getUnsentResetRequests } from "./password-reset";
import { formatDay, formatNumber } from "./format";
import { getPlan } from "./plans";
import type { Viewer } from "./session";
import { accessState, effectiveLimit, getCompanyMonthUsage } from "./usage";

// Alerts shown in the notification bell. They describe the current state, so they
// disappear on their own once the problem is gone.

export type AlertSeverity = "critical" | "warning" | "info";

export interface Alert {
  /** Changes when the situation changes, so a new problem shows as unread again. */
  id: string;
  severity: AlertSeverity;
  title: string;
  detail?: string;
  href?: string;
  at?: string;
  action?: "clear-ai-failures";
}

const DAY = 24 * 60 * 60 * 1000;

const ATTENTION: Record<AttentionKind, { severity: AlertSeverity; label: string }> = {
  limit_reached: { severity: "critical", label: "Reply limit reached" },
  trial_ended: { severity: "critical", label: "Trial ended" },
  whatsapp_error: { severity: "critical", label: "WhatsApp error" },
  near_limit: { severity: "warning", label: "Near reply limit" },
  trial_ending: { severity: "warning", label: "Trial ending" },
};

export function getAlerts(viewer: Viewer): Promise<Alert[]> {
  return viewer.role === "admin" ? adminAlerts() : companyAlerts(viewer.clientId);
}

async function adminAlerts(): Promise<Alert[]> {
  const provider = providerStatus();
  const [overview, failure] = await Promise.all([getPlatformOverview(), getRecentAiFailure().catch(() => null)]);
  const alerts: Alert[] = [];

  if (failure) {
    alerts.push({
      id: `ai-failures:${failure.at}`,
      severity: "critical",
      title: `AI failed ${failure.last24h} ${failure.last24h === 1 ? "time" : "times"} in the last 24 hours`,
      detail: `${failure.provider}: ${failure.message.slice(0, 180)}. Customers were answered by ${provider.fallbacks.join(", then ")}.`,
      at: failure.at,
      action: "clear-ai-failures",
    });
  }
  if (provider.warning) {
    alerts.push({ id: `provider-warning:${provider.warning}`, severity: "critical", title: "AI settings problem", detail: provider.warning });
  }
  if (provider.active === "demo") {
    alerts.push({
      id: "demo-mode",
      severity: "warning",
      title: "No AI key: bots answer from knowledge only",
      detail: "Add GEMINI_API_KEY or GROQ_API_KEY to the environment settings for real AI answers.",
    });
  }
  for (const item of overview.attention) {
    const kind = ATTENTION[item.kind];
    alerts.push({
      id: `${item.key}:${item.detail}`,
      severity: kind.severity,
      title: `${kind.label}: ${item.title}`,
      detail: item.subtitle ? `${item.subtitle}. ${item.detail}` : item.detail,
      href: item.href,
    });
  }
  // Password reset requests that could not be emailed (no email service set up).
  for (const request of await getUnsentResetRequests().catch(() => [])) {
    alerts.push({
      id: `reset-request:${request.clientId}:${request.at}`,
      severity: "warning",
      title: `${request.name} asked for a password reset`,
      detail: `No email was sent${emailConfigured() ? " (sending failed: check the email login on the Account page)" : " because email sending is not set up (SMTP settings)"}. Set a new password on the company page and share it with them.`,
      href: `/dashboard/companies/${request.clientId}`,
      at: request.at,
    });
  }
  // Company chats are private, so "needs a human" alerts go to the company only.
  return alerts;
}

async function companyAlerts(clientId: string): Promise<Alert[]> {
  const [company, usage, stats] = await Promise.all([getClient(clientId), getCompanyMonthUsage(clientId), getStats(clientId)]);
  if (!company) return [];
  const alerts: Alert[] = [];
  const plan = getPlan(company.plan);
  const limit = effectiveLimit(company);
  const state = accessState({ trialEndsAt: company.trialEndsAt, companyStatus: company.status });

  if (limit !== null && usage.messages >= limit) {
    alerts.push({
      id: `limit-reached:${usage.month}`,
      severity: "critical",
      title: "Monthly reply limit reached",
      detail: `Your assistants used all ${formatNumber(limit)} replies of the ${plan.label} plan. Customers see "not available right now" until next month. Contact your provider to upgrade.`,
      href: "/dashboard",
    });
  } else if (limit !== null && usage.messages >= limit * 0.8) {
    alerts.push({
      id: `near-limit:${usage.month}`,
      severity: "warning",
      title: `${Math.round((usage.messages / limit) * 100)}% of monthly replies used`,
      detail: `${formatNumber(usage.messages)} of ${formatNumber(limit)} replies on the ${plan.label} plan.`,
      href: "/dashboard",
    });
  }
  if (state === "trial_ended") {
    alerts.push({
      id: `trial-ended:${company.trialEndsAt}`,
      severity: "critical",
      title: "Free trial ended",
      detail: "Your assistants are not answering customers. Contact your provider to continue.",
    });
  } else if (state === "trial" && company.trialEndsAt && Date.parse(company.trialEndsAt) - Date.now() <= 7 * DAY) {
    alerts.push({
      id: `trial-ending:${company.trialEndsAt}`,
      severity: "warning",
      title: `Free trial ends ${formatDay(company.trialEndsAt)}`,
      detail: "Contact your provider to keep your assistants answering.",
    });
  }
  if (stats.needsHuman > 0) {
    alerts.push({
      id: `needs-human:${stats.needsHuman}`,
      severity: "info",
      title: `${stats.needsHuman} ${stats.needsHuman === 1 ? "chat needs" : "chats need"} a human`,
      detail: "Customers asked for a real person. Open your assistant's Chats tab to follow up.",
      href: "/dashboard",
    });
  }
  return alerts;
}
