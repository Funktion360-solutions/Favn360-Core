import Link from "next/link";

export function PublicHeader() {
  return (
    <header className="border-b border-funktion-line bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link href="/" className="focus-ring">
          <p className="text-2xl font-semibold text-funktion-blue">
            Favn360
          </p>
        </Link>

        <nav className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/" className="rounded px-3 py-2 hover:bg-funktion-pale">
            Forside
          </Link>

          <Link
            href="/om-favn360"
            className="rounded px-3 py-2 hover:bg-funktion-pale"
          >
            Om Favn360
          </Link>

          <Link
            href="/for-borgere"
            className="rounded px-3 py-2 hover:bg-funktion-pale"
          >
            For borgere
          </Link>

          <Link
            href="/for-partsrepraesentanter"
            className="rounded px-3 py-2 hover:bg-funktion-pale"
          >
            For partsrepræsentanter
          </Link>

          <Link
            href="/find-partsrepraesentant"
            className="rounded px-3 py-2 hover:bg-funktion-pale"
          >
            Find partsrepræsentant
          </Link>

          <Link
            href="/kontakt"
            className="rounded px-3 py-2 hover:bg-funktion-pale"
          >
            Kontakt
          </Link>

          <Link
            href="/auth/login"
            className="rounded border border-funktion-line px-4 py-2 font-medium hover:bg-funktion-pale"
          >
            Log ind
          </Link>

          <Link
            href="/auth/signup"
            className="rounded bg-funktion-blue px-4 py-2 font-semibold text-white"
          >
            Opret konto
          </Link>
        </nav>
      </div>
    </header>
  );
}