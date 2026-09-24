import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-black/60 sm:px-6 lg:grid-cols-[1fr_2fr] lg:px-8">
        <div>
          <p className="font-semibold text-funktion-blue">
            Favn360
          </p>

          <p className="mt-4 max-w-md leading-6">
            Favn360 er et digitalt støtte- og dokumentationsværktøj for
            borgere og partsrepræsentanter.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="font-semibold text-black">
              Platform
            </p>

            <div className="mt-3 grid gap-2">
              <Link href="/" className="hover:text-funktion-blue">
                Forside
              </Link>

              <Link href="/om-favn360" className="hover:text-funktion-blue">
                Om Favn360
              </Link>

              <Link href="/for-borgere" className="hover:text-funktion-blue">
                For borgere
              </Link>

              <Link
                href="/for-partsrepraesentanter"
                className="hover:text-funktion-blue"
              >
                For partsrepræsentanter
              </Link>

              <Link
                href="/find-partsrepraesentant"
                className="hover:text-funktion-blue"
              >
                Find partsrepræsentant
              </Link>
            </div>
          </div>

          <div>
            <p className="font-semibold text-black">
              Hjælp og information
            </p>

            <div className="mt-3 grid gap-2">
              <Link href="/faq" className="hover:text-funktion-blue">
                FAQ
              </Link>

              <Link href="/kontakt" className="hover:text-funktion-blue">
                Kontakt
              </Link>

              <Link href="/sikkerhed-og-data" className="hover:text-funktion-blue">
                Sikkerhed og data
              </Link>
            </div>
          </div>

          <div>
            <p className="font-semibold text-black">
              Juridisk
            </p>

            <div className="mt-3 grid gap-2">
              <Link href="/privatlivspolitik" className="hover:text-funktion-blue">
                Privatlivspolitik
              </Link>

              <Link href="/cookiepolitik" className="hover:text-funktion-blue">
                Cookiepolitik
              </Link>

              <Link href="/handelsbetingelser" className="hover:text-funktion-blue">
                Handelsbetingelser
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-funktion-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-black/50 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>
            © {new Date().getFullYear()} Favn360. Alle rettigheder forbeholdes.
          </p>

          <p>
            Favn360 er ikke en offentlig myndighed.
          </p>
        </div>
      </div>
    </footer>
  );
}
