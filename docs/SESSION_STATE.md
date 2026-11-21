# Session state — 21 November 2026

## Objective

Deliver a new independent pharmacology game on TestFlight, a public MIT repository under timelabs-npo, and a shared developer control plane. Work only on Molecule Foundry; existing Rhea and WORLD.EXE projects are separate.

## Verified foundation

- Repository: https://github.com/timelabs-npo/molecule-foundry; public, MIT, main.
- Initial repository commit: a04c6876b61eca705b3f185fd8cb21afbcbbeb89. Application-source publication is being completed in this session.
- Game engine: three complete contracts, eight process cards, four candidates, two budget ledgers, controlled simulated cohorts, Wilson intervals, cumulative evidence, release gates, upgrades and local save validation.
- Initial engine checks: 13/13 passed. Browser, native CI and hosted checks are reported independently in later evidence updates.
- Local production builds: mobile prototype and offline native game export passed.
- Control backend: D1 transactions, immutable drafts, audit journal, idempotency/conflict handling; 10/10 tests and 4/4 Sites package tests passed before final root integration.
- Google brief: https://docs.google.com/document/d/1Jx7aEoU3TACKicCIo9mYfSomvmHpxe8fLPOMa970okE/edit
- Drive: timelabs.ad@gmail.com owns the brief; arcologies@icloud.com has writer permission and a notification request was accepted by Google.

## Apple gate

New identity: `org.timelabs.moleculefoundry`, version `0.1.0`. Team `398XACWZ7G`.

The existing distribution certificate was live-verified as valid. New repository environment `testflight` is main-only and requires the existing owner review. Existing protected distribution and API credentials were installed without disclosure.

The existing API key returns HTTP 403 FORBIDDEN_ERROR when registering the new Bundle ID. New bundle, new-app profile, and App Store Connect app record were not created. The new app has no uploaded build. Registration must be completed with an Apple account that has the required permissions. Do not retry the same denied request or reuse an older app's provisioning profile.

App Store Connect currently contains arcologies@icloud.com with existing broader roles; requested Developer role/new-app access is not yet verified. An old timelabs.ad@gmail.com Admin invitation is expired. Resolve these as app-scoped developer access after new app creation; preserve existing accepted roles.

## GitHub collaboration gate

Authenticated owner is serg-alexv. Exact GitHub login mapping for the two requested email identities remains unverified. Do not invite unrelated same-name accounts. Do not invite people to the organization: its current default repository permission is admin, which would widen unrelated project access. Use new-repository outside-collaborator write access after identity resolution.

## Continuation

1. Finish source publication and inspect exact native CI run; repair concrete failures.
2. Publish and verify the private control plane including a real shared write/readback, then grant the requested teammate access.
3. Complete Apple registration through secure authentication, create the new-app profile, set APP_STORE_APP_ID and profile secret, and dispatch the protected release at the tested commit.
4. Verify processing, tester/build association, invitation state, and actual installation before marking TestFlight complete.
5. Run the first uncoached player study, then follow docs/AWARD_ROADMAP.md.

Never store secrets in this checkpoint, game source, shared document, or automation prompt. A scheduled checkpoint is not continuous background execution.
