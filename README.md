# Favn360 Platform Core

Favn360 er en dansk webplatform til dagbog, funktionsdokumentation og samarbejde i praktik- og beskæftigelsesforløb. Projektet behandler potentielt helbredsoplysninger og andre meget fortrolige personoplysninger. En offentlig GitHub-kopi er derfor ikke det samme som et produktionsklart eller GDPR-compliant system.

## Status

Denne udgave er klargjort til offentlig kildekode med:

- Next.js 16, React 19 og TypeScript
- Docker-image med non-root runtime og read-only containerprofil
- stram Content Security Policy med nonce
- sikker standard: ingen automatisk demo-login, analytics eller AI-behandling
- serverafledt identitet i audit-logning
- same-origin-kontrol på muterende API-ruter
- begrænset og signaturkontrolleret dokumentupload
- fastlåste direkte afhængigheder og automatiske release-kontroller
- GDPR-arbejdsdokumenter og tydelige release-gates

Databasen og dens migrationshistorik er bevidst ikke med i den offentlige pakke. Den tidligere `supabase/`-mappe var ufuldstændig og stemte ikke med den faktiske database. Se [docs/DATABASE.md](docs/DATABASE.md).

## Lokal udvikling

Krav: Node.js 22 eller nyere.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Udfyld kun lokale værdier i `.env.local`. Filen er ignoreret af Git. Projektet åbner ikke et demo-dashboard automatisk, hvis backend-konfiguration mangler.

## Docker

Next.js bygges som `standalone` output. De to `NEXT_PUBLIC_*`-værdier indlejres ved build og er Supabase publishable-konfiguration, ikke serverhemmeligheder.

```bash
docker compose --env-file .env.local up --build
```

Containeren lytter kun på `127.0.0.1:3000`. Sæt en TLS-terminerende reverse proxy eller en managed ingress med rate limits, request-size limits og DDoS/WAF-beskyttelse foran den i produktion.

## Kvalitetskontrol

```bash
npm run check:release
```

Kontrollen scanner tracked filer for almindelige hemmeligheder, lint'er, typechecker, laver dependency audit og bygger applikationen. CI kører den samme grundlinje.

## AI

AI er deaktiveret som standard. `ENABLE_AI_ANALYSIS=true` er ikke tilstrækkeligt alene: koden kræver også et aktivt AI-samtykke for borgeren. Før aktivering skal organisationen dokumentere DPIA, artikel 6- og artikel 9-grundlag, databehandleraftale, EU-dataresidency, retention/ZDR-kontrol og menneskelig kontrol. Se [docs/gdpr/AI-PROCESSING.md](docs/gdpr/AI-PROCESSING.md).

## Før produktionsdrift

Start med [docs/gdpr/RELEASE-CHECKLIST.md](docs/gdpr/RELEASE-CHECKLIST.md). De vigtigste åbne gates er:

1. Rotér de Supabase- og OpenAI-nøgler, der tidligere lå i `.env.example`.
2. Verificér alle live RLS-, Storage- og grant-regler med positive og negative tests.
3. Færdiggør DPIA, behandlingsfortegnelse, slettefrister og databehandleraftaler.
4. Implementér og test komplette workflows for indsigt, eksport, berigtigelse, begrænsning og sletning.
5. Gennemfør ekstern penetrationstest og beredskabsøvelse.
6. Verificér domæne, kontaktoplysninger, privatlivstekst og den faktiske leverandørliste.

## Licensing

Favn360 is **source available, not open source**.

The source code is publicly accessible to support transparency, learning, personal experimentation, evaluation of the technology, and community contributions.

### Personal and educational use

Individuals may use Favn360 for permitted personal, private, non-commercial, and individual educational purposes subject to the terms of the `LICENSE` file.

### Companies and organisations

Use by or for companies, municipalities, regions, governmental authorities, institutions, associations, foundations, NGOs, educational institutions, consultants, or other organisations is **not permitted under the standard licence**.

A separate licence from Funktion360 is required.

This includes organisational:

- testing;
- pilots;
- proof-of-concept deployments;
- internal use;
- production use;
- hosting;
- SaaS;
- professional services.

### Commercial licensing

Commercial and organisational licensing is available separately from Funktion360.

See `COMMERCIAL-LICENSE.md` for further information.

### Contributions

Contributions to official Favn360 repositories are subject to `CONTRIBUTING.md` and the Favn360 Contributor License Agreement (`CLA.md`).

### Important

Public access to this repository does not grant permission to use Favn360 commercially or organisationally.

Copyright © 2026 Funktion360. All rights reserved.

## Sikkerhedsfejl

Offentliggør ikke sårbarheder i et issue. Følg [SECURITY.md](SECURITY.md).
