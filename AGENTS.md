# Molecule Foundry

Scope: only this repository and its new game, control plane, and Apple app `org.timelabs.moleculefoundry`. Rhea RF Spanner and WORLD.EXE are separate projects.

## Working rules

- Keep scientific reference facts separate from authored fictional game effects. Never present simulated participants as real people or medical evidence.
- Pure engine changes require meaningful tests for budgets, prerequisite rules, evidence reuse, deterministic replay, and release gates.
- Clinical reports show denominators, control comparisons, confidence intervals, and model version. An absence of observed events is not proof of no risk.
- Credentials stay in protected runtime storage or GitHub environments, never source, logs, screenshots, or artifacts.
- Release status needs exact commit, run, artifact, Apple build, and observed state. A successful upload is not TestFlight availability.
- Use feature branches and review for subsequent work. The initial foundation is bootstrapped on main.
- Product Design preview runtime under apps/game is protected by its own AGENTS.md. Native export is a separate entry point, not a replacement of that runtime.
- Shared tasks and release decisions belong in the control plane or GitHub. Local browser state is only a game save.

## Commands

`npm ci`, `npm test`, `npm run build:game`, `npm run build:ios-web`, `npm run build:control`.

Read docs/SESSION_STATE.md for the latest verified delivery state and next concrete action.
