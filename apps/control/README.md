# Molecule Foundry development control

A React studio with a Cloudflare Worker and a durable Cloudflare D1 workspace.

## What works

- Fixed-scope live GitHub observations for `timelabs-npo/molecule-foundry`: repository, recent commits, branches, open issues, and workflow runs. Every observation includes its time and individual upstream errors. The Worker caches observations for up to 60 seconds within an isolate.
- Shared task creation and status changes, including assignee and priority, with version conflict detection.
- Immutable balance configuration drafts with expected base revision checks. These do not modify a native app or the playable prototype.
- An attributable audit journal and idempotency receipts written in the same transaction as the underlying mutation.
- Sites sign-in integration. Server-side writes require both trusted identity headers, membership in the two-person allowlist, same-origin JSON POST requests, and an idempotency key.
- Responsive overview, work queue, balance studio, release evidence and journal screens.

No agent runner, Apple upload service or GitHub dispatch is represented as active. Release actions open the real GitHub Actions page.

## Commands

From the repository root after installing workspaces:

```sh
npm run dev --workspace @molecule-foundry/control
npm run build --workspace @molecule-foundry/control
npm run test --workspace @molecule-foundry/control
npm run test:sites --workspace @molecule-foundry/control
```

The Vite preview deliberately strips all Sites identity headers and provides read-only API observations. It does not emulate a team login or a hosted database. Use the authenticated hosted Site to exercise shared writes. The API integration tests use real SQLite with a D1 adapter.

## Hosted layout

The build produces `dist/client`, a self-contained Worker at `dist/server/index.js`, and `.openai` deployment metadata including schema migrations. `.openai/hosting.json` declares `d1: "DB"` and preserves the registered Site ID. Sites provisions the production database and applies migrations on deployment. No tables are created during requests.

The production Worker trusts identity headers only because it is behind the Sites authentication dispatcher. Do not expose it directly from an unauthenticated origin that lets visitors supply those headers. A generic deployment needs an equivalent verified gateway or its own authentication implementation.

Migrations are schema-only. The app creates no synthetic task records and displays no artificial agent activity. If database migrations or the binding are missing, writes fail closed with an explicit storage-unavailable message.

## APIs

| Route | Behavior |
| --- | --- |
| `GET /api/overview` | Current identity, fixed GitHub observations, storage availability and release evidence |
| `GET /api/tasks` | Up to 200 shared tasks; requires workspace membership |
| `POST /api/tasks` | `create` or `set_status`; creates an audit entry and idempotency receipt atomically |
| `GET /api/config` | Up to 100 immutable configuration drafts; requires membership |
| `POST /api/config` | Save a new draft using `baseRevision`; does not publish it |
| `GET /api/audit` | Latest 100 audit events; requires membership |

Writes require `Content-Type: application/json`, an exact same-origin `Origin`, an `Idempotency-Key` of 16–128 permitted characters, and dispatch-authenticated member identity. A stale task `version` or configuration `baseRevision` returns HTTP 409. Replay the exact operation with the same key after an ambiguous network failure; a key cannot be reused for different content or another actor.

## Release evidence

By default the panel records the session's verified Apple bundle-registration HTTP 403 blocker and leaves TestFlight unverified. To publish a newer observation, create `public/release-evidence.json` with actual evidence before building. For example, a blocked observation may contain:

```json
{
  "status": "blocked",
  "appRecord": "unverified",
  "testflight": "not_uploaded",
  "reason": "A precise observed blocker with no credential material.",
  "observedAt": "2026-11-21T20:00:00Z",
  "evidenceUrl": "https://github.com/timelabs-npo/molecule-foundry/actions"
}
```

Only record `appRecord: "verified"` after independently observing the new app. Only record `testflight: "available"` with `buildId`, `observedAt`, and traceable evidence after verifying build availability. Never infer Apple distribution from a passing web build. Root merges game web assets into `dist/client/play/`; `/play/` is served from its own index.

## Tests

The integration suite checks signed-in allowlist and origin enforcement, durable task persistence, idempotent replay, collision rejection, stale-version conflicts, transaction rollback when audit insertion fails, immutable config versions, invalid balance input, private reads, fixed GitHub URL scope, and absence of API-to-SPA fallthrough. Template tests verify static routing and deployable artifact layout.
