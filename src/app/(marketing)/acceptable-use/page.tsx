import type { Metadata } from "next";
import LegalPage from "@/components/marketing/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = { title: LEGAL.acceptableUse.title, description: LEGAL.acceptableUse.description };

export default function AcceptableUsePage() {
  return <LegalPage doc={LEGAL.acceptableUse} />;
}
