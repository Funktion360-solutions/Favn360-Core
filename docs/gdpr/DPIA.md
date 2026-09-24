# DPIA working document

Status: **required before production; not approved**.

The likely risk profile is high because the service combines potentially large-scale or systematic handling of health-related and social data, vulnerable data subjects, relationship-based access, documents, detailed activity records and optional AI analysis. This document is a working structure, not legal approval.

## 1. Processing description

Document controllers/processors, purposes, user groups, data categories, sources, recipients, systems, regions, transfers, storage periods, automated logic and data-flow diagrams. Cover browser, Next.js container, Supabase Auth/Postgres/Storage, mail, observability, support, backups and optional OpenAI processing.

## 2. Necessity and proportionality

For each field and feature, answer:

- Why is it necessary for the stated purpose?
- Can it be omitted, coarsened, pseudonymised or kept locally?
- Who needs access and for how long?
- What happens if the person refuses optional processing?
- Is consent freely given in the actual power relationship?
- Can the same outcome be achieved without AI or special-category data?

## 3. Rights and transparency

Map Article 13/14 information to each collection point. Describe access, correction, restriction, objection, portability, deletion, consent withdrawal, complaint and human-review processes, including identity verification and response deadlines.

## 4. Threat and harm assessment

Assess at minimum: IDOR/BOLA, broken RLS, service-key leakage, insider browsing, account takeover, weak recovery, document malware, accidental sharing, excessive logs, prompt/data leakage, model error, discriminatory inference, re-identification, backup retention, supplier compromise, availability loss and harm to a citizen's employment or public case.

For each risk record likelihood, severity, affected persons, existing measures, planned measures, owner, deadline and residual risk.

## 5. Measures to validate

- least privilege and relationship-based authorization at application and database layers;
- MFA, privileged-access reviews and just-in-time operator access;
- append-only, monitored audit trails without unnecessary raw IP/content;
- encryption in transit/at rest and managed secret rotation;
- immutable migrations and automated RLS negative tests;
- minimised private uploads with malware controls;
- retention automation across primary data, files, logs, PDFs, AI outputs and backups;
- supplier DPAs, approved regions and transfer safeguards;
- tested incident, continuity and restoration procedures;
- human review and opt-out for AI.

## 6. Consultation and approval

Record consultation with affected users/representatives, security, legal/privacy, product owner and DPO where applicable. Name the approver and review date. Re-open the DPIA after material changes, new data categories, new suppliers, new AI use or changed risk.
