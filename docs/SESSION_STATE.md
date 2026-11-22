# Delivery checkpoint — 22 November 2026

## Objective and boundaries

Deliver the new pharmacology game through TestFlight, a public MIT repository under timelabs-npo, and a shared developer control panel. Work only on Molecule Foundry. Rhea RF Spanner and WORLD.EXE are separate projects.

## Delivered surfaces

- Repository: https://github.com/timelabs-npo/molecule-foundry — public, MIT, main.
- Developer workspace: https://molecule-foundry-control.hx31337.chatgpt.site
- Playable web demo: https://molecule-foundry-control.hx31337.chatgpt.site/play/
- Shared brief: https://docs.google.com/document/d/1Jx7aEoU3TACKicCIo9mYfSomvmHpxe8fLPOMa970okE/edit
- Source modules: deterministic engine, React game, SwiftUI/WKWebView offline wrapper, D1 control backend and protected iOS release workflow.

The playable demo has three contracts, eight process cards, four candidates, separate unit-cost and research-budget constraints, controlled simulated cohorts, confidence intervals, cumulative route-specific evidence, release consequences, upgrades and validated local saves. Clinical effects are authored fiction. Structures and transformation abstractions are described in SCIENCE_MODEL.md.

## Verification and provenance

| Gate | Observed evidence |
| --- | --- |
| Engine | 13 meaningful tests passed, including the three-contract campaign |
| First complete UI game | Route, batch, n=480 controlled study, release, 1784 laboratory-credit reward, 900-credit upgrade, reload with 884 credits and Installed status |
| Initial native defect | Run 44939739112 failed the strict game-heading assertion, correctly detecting the unresolved Node global |
| Fixed native validation | Run 44940427388 passed simulator and unsigned-device compile, actual launch, game heading/action and Notebook navigation |
| Fixed source | PR #2 head 7410fc5aac1082ac85748b1edfbb3c3f5af3a8ea; tested merge 8113b13c039356ab405859d883f55b63940273e3; merged main 224350a10e41ee2c2aaf9397e7db3d73666b602c |
| Main confirmation | Run 44941150738 passed native validation on the merged main source |
| LF policy | PR #3 native run 44947861025 passed; only line-ending policy changed |
| Dependency remediation | PR #5 native run 44957654364 passed on source 46b956fc3f2bd995322c24bce215a8c7d0686b4f; tested merge 6bfc98650aae1881aa24960d038da6529da5acf4 |
| Reviewed dependencies merged | Main c351f619aa6682d38fc15b43d9a9d431fbbb7646 has the same source tree as passing PR #5 CI |
| Current main recheck | LF-only main run 44965074558 passed at 00:15:52 UTC; dependency-merge main run 44965171331 was running at the final source-checkpoint preparation |
| Control checks | Initial backend 12/12 and Sites 4/4 passed; PR #7 control API tests expanded to 14/14 with Sites 4/4, passed on merged main in run 44984666394 |
| Hosted v1 | Deployment succeeded; D1 available; real GitHub observations; playable asset hash matched the built native export |
| Hosted v2 | Version 2 deployed at 00:18:22 UTC on 22 November; production overview/play returned 200, D1 available, explicit blocked Apple evidence present, game bundle matched local SHA-256 |
| Production authorization | Service read is not a visitor identity. Private task endpoint returned 401 without identity; no impersonation headers used |

See DESIGN_QA.md and docs/evidence for retained screenshots and receipts. Signing, physical-device installation and TestFlight are separate uncompleted gates. Successful native compilation does not imply an uploaded beta.

## Post-PR #7 source and CI evidence (22 November 2026)

- [PR #7](https://github.com/timelabs-npo/molecule-foundry/pull/7) was technically reviewed with an accurately recorded `COMMENT`, passed its PR-specific checks, and merged into `main` commit **`dcad79cfaba3bb20ef597dc838408aba9548ca40`**. The merge changes only `apps/control/worker/index.js`, `apps/control/tests/control-api.test.mjs`, and `.github/workflows/control-validation.yml`; it does not alter game/native inputs, Apple release, authentication or access controls.
- The public GitHub observation cache now enforces source-time freshness for 20 minutes and a 60-second retry for an all-unavailable snapshot. This is a *tested source behavior*, not yet a measured production improvement.
- [PR native run 44979988430](https://github.com/timelabs-npo/molecule-foundry/actions/runs/44979988430) succeeded, including actual simulator launch and 1/1 XCTest. Its validated synthetic merge SHA was `64be1b8b71a55eb1d228b9ee1d261bca32e6b264`, version `0.1.0`, build `16.1`; device compile was **unsigned** (`CODE_SIGNING_ALLOWED=NO`). Original CI artifact 14737557563 was checked against SHA-256 `cefe7b71fae1be7fb26d7ad52e14c6645d8bbee7855acaf170039a3861f31cba`.
- [Main control run 44984666394](https://github.com/timelabs-npo/molecule-foundry/actions/runs/44984666394) passed with 14/14 control tests and 4/4 Sites tests. [Main native run 44984666400](https://github.com/timelabs-npo/molecule-foundry/actions/runs/44984666400) was **still in progress** at the independent read following merge. Its final verdict and artifact must be checked without transferring the PR test result to the exact main SHA.
- Hosting remains **Site v2**, published from `3f18f744be8ea65c9ccb0a238bccaa17885eb10b`; **merging PR #7 did not deploy the new cache**. Publish only by the authorized Site project channel while preserving its existing audience. Verify a real public-source cache hit, observation timestamps and truthful rate-limit fallback after deployment. Do not treat unauthenticated Site requests as a two-user collaboration test.
- Release gates remain distinct: main source, native XCTest, signed archive, Apple upload acceptance, Apple processing, TestFlight testers/physical install. **All gates after unsigned native validation remain unverified.** Apple interactive authentication is paused following the user's aborted credential handoff; do not prompt or attempt another sign-in without explicit resumption.

## Current Site publication

Version 2 uses Site source commit `3f18f744be8ea65c9ccb0a238bccaa17885eb10b` and deployment `appgdep_6b0234c3a5f481918ec3fc4e71acc076`. The same workspace and `/play/` URLs remain live. The existing custom audience was preserved.

At 00:18:42 UTC, a supported service read verified available D1 storage with zero task/config rows and the new explicit Apple-blocked release receipt. `/api/tasks` returned 401 without visitor identity. `/play/game.js` was 248007 bytes with SHA-256 `24fa6a0e03d438b001d70bd13bbf3b3225d6acedc36289320a86f554f8d2fcdc`, matching the locally built export and deployed manifest. All five public GitHub source requests were rate-limited at this observation and correctly reported unavailable; do not claim their cards are live when the source is unavailable. A signed-in shared write and second-user readback are still unverified.

## Apple blocker

New identity: `org.timelabs.moleculefoundry`, version `0.1.0`, team `398XACWZ7G`.

The existing distribution certificate was verified as valid. The new repository's protected `testflight` environment and existing authorized signing/API credentials were configured without disclosure. The environment is main-only and has an owner review gate.

The existing API key returned HTTP 403 FORBIDDEN_ERROR while registering the new Bundle ID. A new bundle, app-specific provisioning profile and App Store Connect app record have not been verified. No build was uploaded. Do not repeat the unchanged denied API request or reuse another app's profile.

Secure Apple browser sign-in reached the password step and was cancelled. A fresh browser check on 22 November still showed sign-in. Do not reopen the cancelled credential request unless the user asks to resume Apple authentication. Completion requires authorized registration access, the new app record/profile, APP_STORE_APP_ID and the matching profile secret, then protected release at a tested source revision.

arcologies@icloud.com already exists in App Store Connect with broader accepted roles; preserve those roles. Requested Developer/new-app access has not been verified. The old timelabs.ad@gmail.com Admin invitation is expired; new app-scoped developer access should be configured after app creation.

## Team and collaboration

Google: timelabs.ad@gmail.com owns the brief; arcologies@icloud.com is a writer. Site access was granted to both requested addresses, and both are in the application's developer allowlist. Preserve any additional Site viewers already present; visitor access alone does not grant application mutation rights.

GitHub's connected owner is serg-alexv. Exact GitHub login mappings for the two requested email identities remain unverified. Do not infer them from similar names. Organization default repository permission was observed as admin, so use repository-only outside-collaborator write access once identities are established, rather than widening unrelated repository access.

The panel implements shared tasks, immutable configuration drafts, optimistic version checks, idempotency receipts and an attributable transactional journal. Saving a draft does not modify a shipped app. GitHub is read through fixed public endpoints; rate-limited sources are reported unavailable. There is no enrolled agent runner in the panel.

A signed-in production task creation, configuration save and readback by the second developer remain to be verified. Both owner and teammate can use normal ChatGPT sign-in. Do not replace this acceptance test with service-authenticated calls that fabricate user headers.

## Continuous work

The separate Molecule Foundry delivery automation is enabled hourly in Europe/Moscow. Recorded runs during the initial session produced and tested the LF-policy and dependency-remediation PRs. Scheduled work is intermittent execution, not an always-running process. Read fresh repository state before acting; do not duplicate open work or repeat unchanged access requests. Notify on material changes, not empty status checks.

## Next concrete actions

1. Finish exact-`main` native run 44984666400 verification. Deploy the reviewed control-cache source to the existing Site only when an authorized deployment channel is available, preserving the audience; verify production freshness and rate-limit behavior separately.
2. Complete signed-in collaboration acceptance and verify exact GitHub teammate identities.
3. When the user resumes Apple access, create the bundle/profile/app, export the signed archive, upload and wait for processing.
4. Associate the processed build with the intended tester group, verify invitations and a real iPhone installation. Record exact Apple build ID and device/OS.
5. Perform the uncoached first-player, accessibility, chemistry/statistics and performance reviews in AWARD_ROADMAP.md.

Credentials must never appear in this checkpoint, screenshots, game source, shared document, or automation prompt.
