import { NextResponse } from "next/server";
import { BRAND } from "@/lib/brand";
import { escapeHtml, sendEmail } from "@/lib/email";
import { errorResponse, ValidationError } from "@/lib/errors";
import { createInquiry } from "@/lib/inquiries";
import { INDUSTRIES } from "@/lib/marketing";
import { getPlan, PLAN_KEYS } from "@/lib/plans";
import { appUrlFromHeaders } from "@/lib/url";
import { cleanEmail, cleanName } from "@/lib/validate";

const ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;
const attempts = new Map<string, number[]>();

function tooMany(ip: string) {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  attempts.set(ip, recent);
  if (attempts.size > 5000) attempts.clear();
  return recent.length > ATTEMPTS;
}

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

/** Demo request from the website: saved for the admin and emailed to the team. */
export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    if (tooMany(ip)) return NextResponse.json({ error: "Too many requests. Please try again in a few minutes." }, { status: 429 });

    const body = await request.json().catch(() => null);
    // Hidden field only bots fill in: pretend success and do nothing.
    if (body?.website) return NextResponse.json({ ok: true }, { status: 201 });

    const phone = text(body?.phone, 30);
    if (phone && !/^[+\d][\d\s()-]{6,}$/.test(phone)) throw new ValidationError("Enter a valid phone number");
    const industry = text(body?.industry, 40);
    const plan = text(body?.plan, 20);

    const inquiry = await createInquiry({
      name: cleanName(body?.name),
      email: cleanEmail(body?.email),
      business: text(body?.business, 120),
      phone,
      industry: INDUSTRIES.some((i) => i.slug === industry) || industry === "other" ? industry : "",
      plan: PLAN_KEYS.includes(plan as never) ? plan : "",
      message: text(body?.message, 2000),
    });

    const notifyTo = process.env.NOTIFY_EMAIL || process.env.SMTP_USER;
    if (notifyTo) {
      const industryName = INDUSTRIES.find((i) => i.slug === inquiry.industry)?.name ?? inquiry.industry ?? "-";
      const rows: [string, string][] = [
        ["Name", inquiry.name],
        ["Business", inquiry.business ?? "-"],
        ["Email", inquiry.email],
        ["Phone", inquiry.phone ?? "-"],
        ["Industry", industryName],
        ["Plan", inquiry.plan ? getPlan(inquiry.plan).label : "Not sure yet"],
        ["Message", inquiry.message ?? "-"],
      ];
      const link = `${appUrlFromHeaders(request.headers)}/dashboard/inquiries`;
      await sendEmail({
        to: notifyTo,
        replyTo: inquiry.email,
        subject: `New demo request: ${inquiry.business || inquiry.name}`,
        text: `New demo request on the ${BRAND.name} website.\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nAll requests: ${link}`,
        html: `<p>New demo request on the ${BRAND.name} website.</p><table cellpadding="6" style="border-collapse:collapse">${rows
          .map(([k, v]) => `<tr><td style="color:#64748b">${k}</td><td>${escapeHtml(v)}</td></tr>`)
          .join("")}</table><p><a href="${link}">See all requests</a> · Reply to this email to answer ${escapeHtml(inquiry.name)} directly.</p>`,
      }).catch(() => false);
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
