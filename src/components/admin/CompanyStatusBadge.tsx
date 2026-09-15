import { CircleCheck, CirclePause } from "lucide-react";
import type { CompanyStatus } from "@/lib/clients";

export default function CompanyStatusBadge({ status }: { status: CompanyStatus }) {
  const active = status === "active";
  const Icon = active ? CircleCheck : CirclePause;
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${
        active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
      }`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {active ? "Active" : "Inactive"}
    </span>
  );
}
