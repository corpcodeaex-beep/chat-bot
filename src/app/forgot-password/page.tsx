import { KeyRound } from "lucide-react";
import type { Metadata } from "next";
import ForgotPasswordForm from "./ForgotPasswordForm";
import AuthShell from "@/components/auth/AuthShell";

export const metadata: Metadata = { title: "Forgot password", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot your password?"
      text="Enter your company login email and we'll send you a link to choose a new password."
      icon={<KeyRound className="h-6 w-6" aria-hidden />}
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
