import type { Metadata } from "next";
import LegalPage from "@/components/marketing/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = { title: LEGAL.privacy.title, description: LEGAL.privacy.description };

export default function PrivacyPolicyPage() {
  return <LegalPage doc={LEGAL.privacy} />;
}
