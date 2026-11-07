# Development roadmap

The following are proposed improvements, not claims of completed features. Estimates are preliminary and depend on integration decisions.

| Work item | Estimated effort | Acceptance criteria |
| --- | ---: | --- |
| Production-grade adapter interfaces and local mock adapters | 5–8 hours | Validate all injected service contracts; deterministic fixtures |
| Twilio-style webhook example and signature verification tests | 5–8 hours | Reject invalid requests; parse valid vendor/manager responses |
| Idempotent dispatch and timeout processing | 5–8 hours | Duplicate events never create duplicate messages or state changes |
| Business-hours calendar and holiday-aware deadline calculation | 6–10 hours | Overnight, weekend, holiday and DST test cases |
| Backup-vendor reroute and state-transition safeguards | 5–8 hours | Late and conflicting vendor replies are handled predictably |
| End-to-end test harness and CI workflow | 4–6 hours | Repeatable test command and automated checks |

Estimated total: **30–48 hours**, subject to scope validation. No production or customer records are required.

## Boundaries

- Keep commercial Aitha services and unrelated repositories out of this public project.
- Use synthetic tenant, vendor, property and contact data.
- Do not commit live API keys or credentials.
- Record meaningful changes in the existing repository; do not rewrite prior history.
