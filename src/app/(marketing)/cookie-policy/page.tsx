import type { Metadata } from "next";
import LegalPage from "@/components/marketing/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = { title: LEGAL.cookies.title, description: LEGAL.cookies.description };

export default function CookiePolicyPage() {
  return <LegalPage doc={LEGAL.cookies} />;
}
