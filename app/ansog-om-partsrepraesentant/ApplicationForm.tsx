"use client";

import { useState } from "react";

export function ApplicationForm() {
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      roleTitle: String(formData.get("roleTitle") ?? ""),
      companyName: String(formData.get("companyName") ?? ""),
      cvr: String(formData.get("cvr") ?? ""),
      cityArea: String(formData.get("cityArea") ?? ""),
      website: String(formData.get("website") ?? ""),
      profileText: String(formData.get("profileText") ?? ""),
      reason: String(formData.get("reason") ?? "")
    };

    const response = await fetch("/api/representative-applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Ansøgningen kunne ikke sendes.");
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="rounded border border-green-200 bg-green-50 p-6">
        <h2 className="text-2xl font-semibold text-green-900">
          Tak for din ansøgning
        </h2>

        <p className="mt-4 leading-7 text-green-900/80">
          Vi har modtaget din ansøgning om adgang som professionel bruger i
          Favn360.
        </p>

        <p className="mt-4 leading-7 text-green-900/80">
          Ansøgningen gennemgås manuelt for at sikre kvalitet, tryghed og
          korrekt adgang til platformen. Du hører fra os, når ansøgningen er
          behandlet.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-5 rounded border border-funktion-line bg-white p-6 shadow-calm"
    >
      <h2 className="text-2xl font-semibold text-funktion-blue">
        Ansøgningsformular
      </h2>

      <label className="grid gap-2">
        <span className="font-medium">Navn</span>
        <input name="name" required className="rounded border border-funktion-line px-4 py-3" />
      </label>

      <label className="grid gap-2">
        <span className="font-medium">Email</span>
        <input name="email" type="email" required className="rounded border border-funktion-line px-4 py-3" />
      </label>

      <label className="grid gap-2">
        <span className="font-medium">Telefon</span>
        <input name="phone" required className="rounded border border-funktion-line px-4 py-3" />
      </label>

      <label className="grid gap-2">
        <span className="font-medium">Rolle / funktion</span>
        <input
          name="roleTitle"
          required
          placeholder="Fx partsrepræsentant, bisidder, socialrådgiver"
          className="rounded border border-funktion-line px-4 py-3"
        />
      </label>

      <label className="grid gap-2">
        <span className="font-medium">Virksomhed / organisation</span>
        <input name="companyName" className="rounded border border-funktion-line px-4 py-3" />
      </label>

      <label className="grid gap-2">
        <span className="font-medium">CVR</span>
        <input name="cvr" className="rounded border border-funktion-line px-4 py-3" />
      </label>

      <label className="grid gap-2">
        <span className="font-medium">By / område</span>
        <input name="cityArea" className="rounded border border-funktion-line px-4 py-3" />
      </label>

      <label className="grid gap-2">
        <span className="font-medium">Hjemmeside / LinkedIn</span>
        <input name="website" className="rounded border border-funktion-line px-4 py-3" />
      </label>

      <label className="grid gap-2">
        <span className="font-medium">Kort faglig beskrivelse</span>
        <textarea
          name="profileText"
          rows={4}
          className="rounded border border-funktion-line px-4 py-3"
        />
      </label>

      <label className="grid gap-2">
        <span className="font-medium">Hvorfor ønsker du adgang?</span>
        <textarea
          name="reason"
          rows={5}
          required
          className="rounded border border-funktion-line px-4 py-3"
        />
      </label>

      {error ? (
        <p className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        disabled={loading}
        className="rounded bg-funktion-blue px-5 py-3 font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Sender..." : "Send ansøgning"}
      </button>
    </form>
  );
}