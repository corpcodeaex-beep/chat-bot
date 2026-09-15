import { LogIn } from "lucide-react";
import type { Metadata } from "next";
import LoginForm from "./LoginForm";
import AuthShell from "@/components/auth/AuthShell";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const nextPath = typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  return (
    <AuthShell title="Welcome back" text="Log in to manage your chat assistants." icon={<LogIn className="h-6 w-6" aria-hidden />}>
      <LoginForm next={nextPath} />
    </AuthShell>
  );
}
