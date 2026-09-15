import { Bot, GraduationCap, House, Scissors, ShoppingBag, Stethoscope, UtensilsCrossed, type LucideIcon, type LucideProps } from "lucide-react";
import type { TemplateIconKey } from "@/lib/templates";

const ICONS: Record<TemplateIconKey, LucideIcon> = {
  bot: Bot,
  clinic: Stethoscope,
  realestate: House,
  restaurant: UtensilsCrossed,
  school: GraduationCap,
  store: ShoppingBag,
  salon: Scissors,
};

export default function TemplateIcon({ icon, ...props }: { icon: string } & LucideProps) {
  const Icon = ICONS[icon as TemplateIconKey] ?? Bot;
  return <Icon aria-hidden {...props} />;
}
