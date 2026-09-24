# Personal-data incident response

## Immediate actions

1. Page the incident lead and privacy lead; create a restricted incident record.
2. Contain access without destroying evidence: revoke keys/sessions, disable routes, isolate affected services and preserve relevant logs.
3. Establish timeline, affected systems, data categories, data subjects, recipients and whether data was viewed, changed, exfiltrated, lost or unavailable.
4. Do not put personal data, secrets or exploit details in public issues or general chat.

## Assessment

Determine whether this is a personal-data breach, the likely consequences and the risk to people. Record the reasoning even when notification is not required. Identify the controller/processor notification path in customer contracts.

Where required, the controller must notify the competent supervisory authority without undue delay and, where feasible, within 72 hours of awareness. Processors notify controllers without undue delay. High-risk breaches may also require communication to affected people.

## Recovery and follow-up

- eradicate the cause and rotate all related credentials;
- validate authorization and data integrity before reopening;
- restore only from verified backups;
- monitor for recurrence and misuse;
- document decisions, notifications and evidence;
- run a blameless review and update controls, DPIA, risk register and training.

Exercise this runbook before launch and at least annually, including an RLS/IDOR scenario and a leaked service-role key scenario.
