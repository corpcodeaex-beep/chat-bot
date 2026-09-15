import type { Metadata } from "next";
import LegalPage from "@/components/marketing/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = { title: LEGAL.refunds.title, description: LEGAL.refunds.description };

export default function RefundPolicyPage() {
  return <LegalPage doc={LEGAL.refunds} />;
}
