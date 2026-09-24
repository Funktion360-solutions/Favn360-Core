# Security policy

## Reporting

Do not disclose a vulnerability in a public issue. Send a minimal report to the verified security contact for the project. Before publication, replace this paragraph with a working security mailbox on the verified Favn360 domain and add a `security.txt` file.

Include the affected route or component, reproduction steps, impact, and whether personal data may have been exposed. Do not access, copy, alter, or retain real user data beyond what is strictly necessary to demonstrate the issue.

## Supported version

Only the latest release on the default branch receives security fixes until a formal support policy is published.

## Secrets

Never commit `.env` files, private keys, service-role keys, database passwords, access tokens or production data. A Supabase publishable key may be present in a built client, but a service-role or secret key must remain server-only.

## Response targets

- acknowledge a credible report within two business days;
- contain confirmed critical exposure immediately;
- assess whether the incident is a personal-data breach;
- preserve evidence without placing sensitive content in tickets or chat;
- follow the incident process in `docs/gdpr/INCIDENT-RESPONSE.md`.
