import NewBotForm from "./NewBotForm";
import { getClient } from "@/lib/clients";
import { getPlan } from "@/lib/plans";
import { pageViewer } from "@/lib/session";
import { TEMPLATES } from "@/lib/templates";

export default async function NewBotPage() {
  const viewer = await pageViewer();
  const templates = TEMPLATES.map(({ key, label, icon, color, description, businessName }) => ({
    key,
    label,
    icon,
    color,
    description,
    businessName,
  }));

  if (viewer.role === "admin") return <NewBotForm templates={templates} />;

  const company = await getClient(viewer.clientId);
  const plan = getPlan(company?.plan ?? "standard");
  return (
    <NewBotForm
      templates={templates}
      defaultBusinessName={viewer.name}
      capacity={{ used: company?.botCount ?? 0, max: plan.maxBots, planLabel: plan.label }}
    />
  );
}
