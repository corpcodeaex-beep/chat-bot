import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { getClientLogin, setClientPassword } from "@/lib/clients";
import { verifyPassword } from "@/lib/crypto";
import { errorResponse, HttpError } from "@/lib/errors";
import { requireViewer } from "@/lib/session";
import { cleanPassword } from "@/lib/validate";

/** A client changes their own password. Other devices are logged out; this one stays logged in. */
export async function POST(request: Request) {
  try {
    const viewer = await requireViewer();
    if (viewer.role !== "client") throw new HttpError(400, "The admin password is set with ADMIN_PASSWORD in .env.local");
    const body = await request.json().catch(() => null);
    const login = await getClientLogin(viewer.email);
    if (!login || !(await verifyPassword(String(body?.currentPassword ?? ""), login.passwordHash))) {
      throw new HttpError(400, "Current password is wrong");
    }
    const version = await setClientPassword(viewer.clientId, cleanPassword(body?.newPassword));
    if (version === null) throw new HttpError(404, "Account not found");

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, createSessionToken({ role: "client", clientId: viewer.clientId, version }), sessionCookieOptions);
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
