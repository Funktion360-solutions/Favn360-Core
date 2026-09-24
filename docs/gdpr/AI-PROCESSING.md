# AI processing gate

AI analysis is off by default in code and also requires a positive `citizen_consents.ai_analysis` value. Do not enable it merely because a checkbox exists.

Before activation:

1. Define purpose, necessity, Article 6 basis and Article 9(2) condition for the real controller/customer relationship.
2. Determine whether consent can be freely given and withdrawn without disadvantage, especially in employment, municipal or dependency contexts.
3. Sign supplier terms/DPA, document subprocessors and transfers, configure the approved European endpoint and obtain the required Modified Abuse Monitoring or Zero Data Retention controls.
4. Verify the chosen API endpoint's actual retention behavior. Default API abuse-monitoring logs may retain content for a limited period.
5. Keep names, IDs, contact persons, file names and other direct identifiers out of prompts. Review this again whenever prompts change.
6. Provide an equivalent non-AI workflow, visible provenance, meaningful human review and a way to challenge/correct outputs.
7. Ensure AI output never alone determines entitlement, employability, health status or another legally/significantly consequential outcome.
8. Add deletion propagation and audit evidence for inputs, outputs and provider-side state.

Any model, endpoint, prompt, supplier, retention or residency change reopens this assessment and the DPIA.
