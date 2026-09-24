"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const municipalities = [
  "Aabenraa", "Aalborg", "Aarhus", "Albertslund", "Allerød", "Assens",
  "Ballerup", "Billund", "Bornholm", "Brøndby", "Brønderslev", "Dragør",
  "Egedal", "Esbjerg", "Fanø", "Favrskov", "Faxe", "Fredensborg",
  "Fredericia", "Frederiksberg", "Frederikshavn", "Frederikssund",
  "Furesø", "Gentofte", "Gladsaxe", "Glostrup", "Greve", "Gribskov",
  "Guldborgsund", "Haderslev", "Halsnæs", "Hedensted", "Helsingør",
  "Herlev", "Herning", "Hillerød", "Hjørring", "Holbæk", "Holstebro",
  "Horsens", "Hvidovre", "Høje-Taastrup", "Hørsholm", "Ikast-Brande",
  "Ishøj", "Jammerbugt", "Kalundborg", "Kerteminde", "Kolding",
  "København", "Køge", "Langeland", "Lejre", "Lemvig", "Lolland",
  "Lyngby-Taarbæk", "Læsø", "Mariagerfjord", "Middelfart", "Morsø",
  "Norddjurs", "Nordfyns", "Nyborg", "Næstved", "Odder", "Odense",
  "Odsherred", "Randers", "Rebild", "Ringkøbing-Skjern", "Ringsted",
  "Roskilde", "Rudersdal", "Rødovre", "Samsø", "Silkeborg", "Skanderborg",
  "Skive", "Slagelse", "Solrød", "Sorø", "Stevns", "Struer",
  "Svendborg", "Syddjurs", "Sønderborg", "Thisted", "Tønder", "Tårnby",
  "Vallensbæk", "Varde", "Vejen", "Vejle", "Vesthimmerland", "Viborg",
  "Vordingborg", "Ærø"
];

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    const payload = {
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      municipality: String(formData.get("municipality") ?? ""),
      password: String(formData.get("password") ?? ""),
      consentTerms: formData.get("consentTerms") === "on",
      privacyNoticeAccepted: formData.get("privacyNoticeAccepted") === "on"
    };

    const response = await fetch("/api/auth/signup-citizen", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Kontoen kunne ikke oprettes.");
      setLoading(false);
      return;
    }

    router.push("/auth/login");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-5 rounded border border-funktion-line bg-white p-6 shadow-calm"
    >
      <h2 className="text-2xl font-semibold text-funktion-blue">
        Opret borgerkonto
      </h2>

      <label className="grid gap-2">
        <span className="font-medium">Fulde navn</span>
        <input name="fullName" required className="rounded border border-funktion-line px-4 py-3" />
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
        <span className="font-medium">Kommune</span>
        <select name="municipality" required className="rounded border border-funktion-line px-4 py-3">
          <option value="">Vælg kommune</option>
          {municipalities.map((municipality) => (
            <option key={municipality} value={municipality}>
              {municipality}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2">
        <span className="font-medium">Adgangskode</span>
        <input name="password" type="password" required minLength={12} maxLength={128} className="rounded border border-funktion-line px-4 py-3" />
      </label>

      <label className="flex gap-3 text-sm leading-6 text-black/70">
        <input name="consentTerms" type="checkbox" required className="mt-1" />
        <span>
          Jeg accepterer Favn360s{" "}
          <Link href="/handelsbetingelser" className="text-funktion-blue underline">
            handelsbetingelser
          </Link>{" "}
          og{" "}
          <Link href="/privatlivspolitik" className="text-funktion-blue underline">
            privatlivspolitik
          </Link>
          .
        </span>
      </label>

      <label className="flex gap-3 text-sm leading-6 text-black/70">
        <input name="privacyNoticeAccepted" type="checkbox" required className="mt-1" />
        <span>
          Jeg bekræfter, at jeg har læst privatlivspolitikken og informationen
          om behandling af mine oplysninger.
        </span>
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
        {loading ? "Opretter..." : "Opret gratis borgerkonto"}
      </button>
    </form>
  );
}
