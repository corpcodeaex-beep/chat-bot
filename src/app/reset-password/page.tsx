import Link from "next/link";
import ResetPasswordForm from "./ResetPasswordForm";
import { isResetTokenValid } from "@/lib/password-reset";

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { token } = await searchParams;
  const valid = typeof token === "string" && token.length > 20 && (await isResetTokenValid(token));

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold">Choose a new password</h1>
        {valid ? (
          <ResetPasswordForm token={token as string} />
        ) : (
          <>
            <p className="text-sm text-slate-600">This reset link is invalid, already used, or older than 1 hour.</p>
            <Link href="/forgot-password" className="text-sm text-indigo-700 hover:underline">
              Ask for a new link
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
