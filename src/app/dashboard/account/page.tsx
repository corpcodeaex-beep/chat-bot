import { CircleCheck, CirclePause, TriangleAlert } from "lucide-react";
import ChangePasswordForm from "./ChangePasswordForm";
import { verifyEmailSetup } from "@/lib/email";
import { pageViewer } from "@/lib/session";

export default async function AccountPage() {
  const viewer = await pageViewer();

  if (viewer.role === "admin") {
    const email = await verifyEmailSetup();
    return (
      <div className="max-w-xl space-y-6">
        <h1 className="text-2xl font-semibold">Account</h1>
        <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          You are the admin. Change the admin password with <code>ADMIN_PASSWORD</code> in the environment settings and restart the app.
        </p>
        <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-5 text-sm">
          <h2 className="font-semibold text-slate-900">Email sending (forgot password)</h2>
          {email.ok ? (
            <p className="flex items-center gap-2 text-emerald-700">
              <CircleCheck className="h-4 w-4" aria-hidden />
              Working: {email.method === "smtp" ? `logged in to ${process.env.SMTP_HOST} as ${process.env.SMTP_USER}` : "Resend API key set"}.
            </p>
          ) : email.method === "none" ? (
            <p className="flex items-start gap-2 text-slate-600">
              <CirclePause className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              Not set up. Add SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASSWORD (Gmail app password) to the environment settings.
            </p>
          ) : (
            <p className="flex items-start gap-2 text-red-700">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>
                The email login failed: {email.error}. For Gmail, check that SMTP_USER is the full Gmail address and SMTP_PASSWORD is a 16-letter app
                password (not your normal password).
              </span>
            </p>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-2xl font-semibold">Account</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm">
        <div className="font-medium">{viewer.name}</div>
        <div className="text-slate-500">{viewer.email}</div>
      </div>
      <ChangePasswordForm />
    </div>
  );
}
