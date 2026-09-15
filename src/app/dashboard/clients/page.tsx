import { redirect } from "next/navigation";

// Old address: the page is now called Companies.
export default function ClientsPage() {
  redirect("/dashboard/companies");
}
