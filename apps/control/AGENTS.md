# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.


## Approved direction and control-plane boundaries

Use the Blue Hour Laboratory direction: deep navy, pale cyan, restrained amber, professional sparse layouts, clear clinical uncertainty. Root owns Site registration, access policy, publishing, and browser QA. This app uses the existing Product Design prototype, with a self-contained Cloudflare Worker, D1 schema migrations and trusted Sites identity headers.

Repository source is timelabs-npo/molecule-foundry only. GitHub observations must come from the fixed public REST endpoints in the Worker. Do not introduce fabricated CI, deployment, agent activity, or fake seeded tasks. Never put bearer tokens, API keys, or private keys in browser state or source.

D1 migrations are immutable after publication. Append a new migration for schema changes. Task, audit and operation receipt writes must be atomic. Keep optimistic version checks and idempotency checks when changing the API. Native-app configuration is not remotely updated by a saved balance draft.

Local Vite preview deliberately strips all trusted identity headers and is read-only. Hosted identity comes from Sites dispatch; do not add a production auth bypass.
