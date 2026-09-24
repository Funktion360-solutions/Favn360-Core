# GDPR and security release checklist

No production launch is approved until every mandatory item has an owner, evidence link and approval date.

## Governance and legal basis

- [ ] Decide and contractually document whether Favn360 is controller, joint controller or processor for each customer flow.
- [ ] Approve a lawful basis under Article 6 for every purpose.
- [ ] Approve a specific Article 9(2) condition for every special-category flow; do not use a generic signup checkbox as a substitute.
- [ ] Complete and approve the DPIA; consult the supervisory authority if high residual risk remains.
- [ ] Document whether a DPO is mandatory and record the reasoning.
- [ ] Complete the record of processing activities and legitimate-interest assessments where used.
- [ ] Ensure privacy notices match the real product, controller, processors, regions, transfers and retention periods.

## Suppliers and international transfers

- [ ] Sign DPAs with hosting, Supabase, email, support, monitoring and AI suppliers.
- [ ] Lock database, Storage, backups and logs to approved regions where available.
- [ ] Record every subprocessor and change-notification mechanism.
- [ ] Perform transfer impact assessments and put SCCs/other transfer mechanisms in place where required.
- [ ] Confirm deletion behavior for database, Storage, logs, backups and support systems.

## Technical controls

- [ ] Revoke and rotate all keys that appeared in the original `.env.example`.
- [ ] Enforce MFA for operators and privileged application users.
- [ ] Run Supabase Security Advisor with zero unresolved critical/high findings.
- [ ] Test every table, view, function and Storage path with allow/deny cases for all roles.
- [ ] Verify no authorization decision uses user-editable `user_metadata`.
- [ ] Confirm service-role access is server-only, narrowly used and monitored.
- [ ] Put a TLS reverse proxy/WAF in front of the container with rate and body-size limits.
- [ ] Add malware scanning/quarantine before accepting office documents or expanding the upload allowlist.
- [ ] Complete an independent penetration test and remediate findings.
- [ ] Restore a backup in an isolated environment and document recovery time and recovery point.

## Data-subject rights and lifecycle

- [ ] Test identity verification and workflows for access, correction, portability, objection, restriction and deletion.
- [ ] Apply the approved retention schedule automatically and produce deletion evidence.
- [ ] Define how legal holds override deletion without silently retaining unrelated data.
- [ ] Ensure account deletion revokes sessions before deleting the user.
- [ ] Handle data in backups and derived AI/PDF artifacts consistently.

## AI gate

- [ ] Keep `ENABLE_AI_ANALYSIS=false` until the AI processing assessment is approved.
- [ ] Require granular, withdrawable consent or another approved legal basis; document consequences of refusal.
- [ ] Enable approved EU data residency and Modified Abuse Monitoring/Zero Data Retention where required.
- [ ] Confirm no automated decision with legal or similarly significant effect is made.
- [ ] Test human review, provenance labels, prompt minimisation and deletion of AI outputs.

## Release evidence

- [ ] `npm run check:release` passes from a clean checkout.
- [ ] Container scan and SBOM have no unaccepted critical/high findings.
- [ ] Git history and release artifacts pass secret scanning.
- [ ] Incident-response tabletop and 72-hour notification workflow have been exercised.
- [ ] Domain, security mailbox, privacy contact and `security.txt` are verified.
