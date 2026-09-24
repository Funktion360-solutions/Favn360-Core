import { redirect } from "next/navigation";
import { hasSupabaseEnv, isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { ensureProfileForUser } from "@/lib/profile";
import { dashboardPathForRole } from "@/lib/routes";
import type { UserRole } from "@/types/database";

export type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!hasSupabaseEnv()) {
    if (!isDemoMode()) return null;
    return {
      id: "demo-citizen",
      email: "demo@favn360.dk",
      fullName: "Demo Borger",
      role: "citizen"
    };
  }

  let data;
  let error;
  let supabase;

  try {
    supabase = await createClient();
    const result = await supabase.auth.getUser();
    data = result.data;
    error = result.error;
  } catch {
    return null;
  }

  if (error || !data.user?.email) {
    return null;
  }

  return ensureProfileForUser(data.user, supabase);
}

function normalizeRequiredRole(role?: UserRole | "borger" | "admin" | "partsrepraesentant") {

  if (role === "borger") {

    return "citizen";

  }

  if (role === "admin") {

    return "administrator";

  }

  if (role === "partsrepraesentant") {

    return "representative";

  }

  return role;

}

export async function requireUser(role?: UserRole | "borger" | "admin" | "partsrepraesentant")  {
  const requiredRole = normalizeRequiredRole(role);

  if (isDemoMode() && requiredRole === "administrator") {
    return {
      id: "demo-admin",
      email: "admin@favn360.dk",
      fullName: "Demo Administrator",
      role: "administrator" as const
    };
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (requiredRole && user.role !== requiredRole) {
    redirect(dashboardPathForRole(user.role));
  }

  return user;
}
