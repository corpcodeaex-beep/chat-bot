import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/errors";
import { resetPassword } from "@/lib/password-reset";
import { cleanPassword } from "@/lib/validate";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const token = typeof body?.token === "string" ? body.token : "";
    if (!token) return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
    await resetPassword(token, cleanPassword(body?.password));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
