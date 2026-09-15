import { CircleAlert, KeyRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import ResetPasswordForm from "./ResetPasswordForm";
import AuthShell from "@/components/auth/AuthShell";
import { authButton } from "@/components/auth/AuthField";
import { isResetTokenValid } from "@/lib/password-reset";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { token } = await searchParams;
  const valid = typeof token === "string" && token.length > 20 && (await isResetTokenValid(token));

  return (
    <AuthShell title="Choose a new password" icon={<KeyRound className="h-6 w-6" aria-hidden />}>
      {valid ? (
        <ResetPasswordForm token={token as string} />
      ) : (
        <div className="space-y-5">
          <p className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            This reset link is invalid, already used, or older than 1 hour.
          </p>
          <Link href="/forgot-password" className={authButton}>
            Ask for a new link
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
