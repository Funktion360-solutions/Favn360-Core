import Link from "next/link";
import { CalendarDays, ClipboardList, FileText, FlaskConical, LayoutDashboard, LogOut, MessageSquarePlus, UserRound } from "lucide-react";
import type { CurrentUser } from "@/lib/auth";
import { MessageModal } from "./MessageModal";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["citizen", "administrator"] },
  { href: "/dashboard/admin", label: "Administration", icon: FileText, roles: ["administrator"] },
  { href: "/dashboard/admin/ansogninger", label: "Ansøgninger", icon: ClipboardList, roles: ["administrator"] },
  { href: "/dashboard/admin/product-operations", label: "Product Operations", icon: FlaskConical, roles: ["administrator"] },
  { href: "/dagbog", label: "Dagbog", icon: ClipboardList, roles: ["citizen"] },
  { href: "/kalender", label: "Kalender", icon: CalendarDays },
  { href: "/feedback-beta", label: "Feedback & Beta", icon: MessageSquarePlus },
  { href: "/profil", label: "Min profil", icon: UserRound }
];

export function AppShell({ user, children }: { user: CurrentUser; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-funktion-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <Link href={user.role === "administrator" ? "/dashboard/admin" : "/dashboard"} className="text-2xl font-semibold text-funktion-blue focus-ring">
              Favn360
            </Link>
            <p className="mt-1 text-sm text-black/70">Digital dagbog og funktionsdokumentation</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded bg-funktion-pale px-3 py-2 text-black">
              {user.fullName} · {user.role === "administrator" ? "Administrator" : user.role === "citizen" ? "Borger" : "Rolle ikke angivet"}
            </span>
            {user.role === "citizen" || user.role === "representative" ? (
              <MessageModal user={user} />
              ) : null}
            <form action="/auth/signout" method="post">
              <button className="focus-ring inline-flex items-center gap-2 rounded border border-funktion-line px-3 py-2 text-black hover:bg-funktion-pale">
                <LogOut className="h-4 w-4" />
                Log ud
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col">
          {navItems
            .filter((item) => !item.roles || item.roles.includes(user.role))
            .map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="focus-ring inline-flex min-w-fit items-center gap-2 rounded border border-funktion-line px-4 py-3 text-sm font-medium text-black hover:bg-funktion-pale"
              >
                <Icon className="h-4 w-4 text-funktion-blue" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <main>{children}</main>
      </div>
    </div>
  );
}
