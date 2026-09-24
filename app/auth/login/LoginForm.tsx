"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { dashboardPathForRole } from "@/lib/routes";
import type { CurrentUser } from "@/lib/auth";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setError("Login er midlertidigt utilgængeligt, fordi serveren mangler sikker konfiguration.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });

    if (loginError || !data.user) {
      setError("Login mislykkedes. Kontroller email og adgangskode.");
      setLoading(false);
      return;
    }

    const profileResponse = await fetch("/api/auth/ensure-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    if (!profileResponse.ok) {
      setError("Login lykkedes, men profilen kunne ikke klargøres.");
      setLoading(false);
      return;
    }

    const profilePayload = (await profileResponse.json()) as { profile?: CurrentUser; error?: string };

    if (!profilePayload.profile) {
      setError(profilePayload.error ?? "Login lykkedes, men profilen kunne ikke klargøres.");
      setLoading(false);
      return;
    }

    await fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    router.push(dashboardPathForRole(profilePayload.profile.role));
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 rounded border border-funktion-line bg-white p-6 shadow-calm">
      <div className="flex items-center gap-3 text-funktion-blue">
        <LockKeyhole className="h-5 w-5" />
        <h1 className="text-2xl font-semibold">Log ind</h1>
      </div>
      <label className="grid gap-2">
        <span className="font-medium">Email</span>
        <input
          name="email"
          type="email"
          required
          className="focus-ring rounded border border-funktion-line px-4 py-3"
          autoComplete="email"
        />
      </label>
      <label className="grid gap-2">
        <span className="font-medium">Adgangskode</span>
        <input
          name="password"
          type="password"
          required
          className="focus-ring rounded border border-funktion-line px-4 py-3"
          autoComplete="current-password"
        />
      </label>
      {error ? <p className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <button
        disabled={loading}
        className="focus-ring rounded bg-funktion-blue px-5 py-3 font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Logger ind..." : "Log ind"}
      </button>
    </form>
  );
}
