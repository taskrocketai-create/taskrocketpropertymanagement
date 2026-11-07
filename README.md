# TaskRocket Property Response Agent (Aitha PM component)

A JavaScript module for property-management maintenance-response workflows. It provides severity-based vendor response deadlines, manager and vendor SMS reply handling, tenant/manager/vendor message templates, and a scheduled timeout watcher. It is intended for integration into a property-management system rather than as a standalone hosted application.

## Current capabilities

- Four maintenance severity categories and vendor response windows
- Vendor accept/decline parsing, late-response handling, and incident-state updates
- Property-manager instructions for deferring escalation to business hours, including confirmation of ambiguous replies
- Vendor timeout detection with manager notification
- Reusable message templates and Airtable incident field definitions
- Unit tests for the business logic

**Scope:** This repository contains a maintenance-response workflow component, not the full proprietary Aitha platform. It delegates persistence, SMS delivery, and event logging to injected services. It does not itself provide a production-ready Twilio endpoint, scheduler, or hosted app.

## Technology

Node.js, CommonJS JavaScript, Jest, ESLint. The service interfaces are designed to be connected to Airtable and an SMS provider by an integrating application.

## Run locally

Prerequisite: a recent supported Node.js/npm installation.

```bash
npm install
npm test
npm run lint
```

To use the module from another Node.js program:

```js
const { classifyVendorReply, getVendorDeadline, SEVERITY } = require('./src');
console.log(classifyVendorReply('ACCEPT 2:30 PM'));
console.log(getVendorDeadline(SEVERITY.URGENT));
```

Production integrations must supply the expected `services` functions for incident writes, notifications, and logging. See `src/handlers/` for interface details.

## Repository layout

- `src/constants/`: incident statuses, severity rules and deadlines
- `src/handlers/`: manager replies, vendor replies and timeout watcher
- `src/messages/`: templated outbound messages
- `src/airtable/`: incident schema definitions
- `tests/`: unit tests

## Planned development

See [ROADMAP.md](ROADMAP.md) for an indicative backlog of real engineering work, including adapter integration, reliability, safety and test coverage. Planned items are not represented as already implemented.

## Data and security

Do not commit tenant/vendor records, real phone numbers, access tokens, SMS provider keys or Airtable credentials. Use fabricated test fixtures. The public module must not be used with live personal data until the hosting application provides appropriate access controls, privacy safeguards and operational review.

## Ownership and license

Copyright (c) 2026 Alan Howard. Licensed under the [MIT License](LICENSE). This repository's license applies to its contents, not to separate private Aitha or TaskRocket repositories.
