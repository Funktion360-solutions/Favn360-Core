import type { UserRole } from "@/types/database";

export function dashboardPathForRole(role: UserRole) {
  if (role === "administrator") {
    return "/dashboard/admin";
  }

  if (role === "representative") {
    return "/dashboard/partsrepraesentant";
  }

  if (role === "citizen") {
    return "/dashboard/borger";
  }

  return "/profil";
}

export function roleLabel(role: UserRole) {
  if (role === "administrator") {
    return "Administrator";
  }

  if (role === "representative") {
    return "Partsrepræsentant";
  }

  if (role === "citizen") {
    return "Borger";
  }

  return "Rolle ikke angivet";
}