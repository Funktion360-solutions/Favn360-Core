import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { dashboardPathForRole } from "@/lib/routes";

export default async function DashboardPage() {
  const user = await requireUser();

  redirect(dashboardPathForRole(user.role));
}
