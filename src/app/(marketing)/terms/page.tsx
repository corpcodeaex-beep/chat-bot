import type { Metadata } from "next";
import LegalPage from "@/components/marketing/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = { title: LEGAL.terms.title, description: LEGAL.terms.description };

export default function TermsPage() {
  return <LegalPage doc={LEGAL.terms} />;
}
