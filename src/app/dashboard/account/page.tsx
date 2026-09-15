import ChangePasswordForm from "./ChangePasswordForm";
import { pageViewer } from "@/lib/session";

export default async function AccountPage() {
  const viewer = await pageViewer();
  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-2xl font-semibold">Account</h1>
      {viewer.role === "admin" ? (
        <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          You are the admin. Change the admin password with <code>ADMIN_PASSWORD</code> in <code>.env.local</code> and restart the app.
        </p>
      ) : (
        <>
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm">
            <div className="font-medium">{viewer.name}</div>
            <div className="text-slate-500">{viewer.email}</div>
          </div>
          <ChangePasswordForm />
        </>
      )}
    </div>
  );
}
