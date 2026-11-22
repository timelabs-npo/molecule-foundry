# Delivery checkpoint — 22 November 2026

## Objective and boundaries

Deliver the new pharmacology game through TestFlight, a public MIT repository under timelabs-npo, and a shared developer control panel. Work only on Molecule Foundry. Rhea RF Spanner and WORLD.EXE are separate projects.

## Current TestFlight delivery

**UI verified at 06:51:01 UTC and independently confirmed through the Apple API at 06:54:39–06:54:51 UTC on 22 November 2026:** Molecule Foundry **0.1.0 (23.1)** is **Testing** in the internal **Molecule Foundry Developers** group. App Store Connect showed two testers and one build, with both testers reported as having installed this exact build. This is Apple-reported installation evidence; independently exercised gameplay on a physical iPhone remains unverified.

| Gate | Verified evidence |
| --- | --- |
| New Apple app | Molecule Foundry, app ID `6837899703`, bundle `org.timelabs.moleculefoundry`, team `398XACWZ7G` |
| Signed release source | `d533b0cd8ad195c16838fe4a69732259c9aa8634`; includes reviewed PR #9 iPad orientation remediation |
| Release workflow | [Run 44993976758, attempt 1](https://github.com/timelabs-npo/molecule-foundry/actions/runs/44993976758) succeeded at 2026-11-22T06:47:44Z; native job `137121586494` and release job `137123999835` passed |
| Native validation | Simulator launch and game/Notebook UI gate passed; root separately reviewed the populated `simulator-launch.png` screenshot |
| Signed export | Signature verified; IPA SHA-256 `27e8bc0005b240f682c4dccdfeef820961696b7f5bbe263fcd2962e7d4cd5f64` |
| Apple upload | Accepted at 2026-11-22T06:46:07.422524Z |
| Apple processing | Build `0bba15f4-a073-4d97-857a-ec921eb8bcf0` reported `VALID` at 2026-11-22T06:47:39Z |
| Internal distribution | [Molecule Foundry Developers](https://appstoreconnect.apple.com/teams/7ecf5889-417e-4f6d-80cf-c3640155a4cc/apps/6837899703/testflight/groups/5a93cfb4-bd7c-4c0c-acbd-ade02816d8c1), group `5a93cfb4-bd7c-4c0c-acbd-ade02816d8c1`; exact build 0.1.0 (23.1), status `Testing`, 90 days remaining at observation |
| Tester installation | UI showed both assigned testers `Installed 0.1.0 (23.1)`; independent API readback confirmed both exact group members `INSTALLED`, group membership of the exact build and internal build state `IN_BETA_TESTING` |
| What to Test | Saved and verified in Apple UI |
| Physical gameplay | Not independently exercised on a physical device; do not equate Apple-reported installation with a gameplay acceptance test |
| External review / Apple Arcade | Neither external beta review nor an Apple Arcade submission is recorded by this internal TestFlight delivery |

The public [release receipt](../apps/control/public/release-evidence.json) records the exact source, Apple build, timestamps and artifact digests. The [final delivery receipt](https://github.com/timelabs-npo/molecule-foundry/issues/4#issuecomment-7075607432) holds the session's observed Apple/group evidence. The distributed binary remains tied to the signed source above even when later web/docs commits advance `main`.

### Retained artifact evidence

- Signed-release artifact [14742939886](https://github.com/timelabs-npo/molecule-foundry/actions/runs/44993976758/artifacts/14742939886): ZIP SHA-256 `123d99ab411245ba290c4d55ee475bb7e7b5603daff5dfdfa9233de969065e95`, 3319679 bytes.
- Native-validation artifact [14742894466](https://github.com/timelabs-npo/molecule-foundry/actions/runs/44993976758/artifacts/14742894466): ZIP SHA-256 `7aaad3ed218527548173387d1bbf549736251bb91e33bc4aa4421db16eb7d806`, independently downloaded and hash checked by root.
- The original machine receipts retain their pre-distribution fields, including required human screenshot review and `tester_access_verified: false`. Root's later visual review and the independent Apple/group readback establish those subsequent observations separately; the original artifacts remain unchanged.
- Credential material, private keys and provisioning-profile contents are excluded from public evidence.

## Delivered surfaces

- Repository: https://github.com/timelabs-npo/molecule-foundry — public, MIT, main.
- Developer workspace: https://molecule-foundry-control.hx31337.chatgpt.site
- Playable web demo: https://molecule-foundry-control.hx31337.chatgpt.site/play/
- Shared brief: https://docs.google.com/document/d/1Jx7aEoU3TACKicCIo9mYfSomvmHpxe8fLPOMa970okE/edit
- Source modules: deterministic engine, React game, SwiftUI/WKWebView offline wrapper, D1 control backend and protected iOS release workflow.

The playable demo has three contracts, eight process cards, four candidates, separate unit-cost and research-budget constraints, controlled simulated cohorts, confidence intervals, cumulative route-specific evidence, release consequences, upgrades and validated local saves. Clinical effects are authored fiction. Structures and transformation abstractions are described in SCIENCE_MODEL.md.

## Site publication checkpoint

The final web/docs candidate updates the panel from the historical Apple blocker to the verified TestFlight receipt and includes the reviewed PR #7 public-source cache fix. At this source checkpoint, the last verified production publication is still **Site v2**, source `3f18f744be8ea65c9ccb0a238bccaa17885eb10b`, deployment `appgdep_6b0234c3a5f481918ec3fc4e71acc076`. A merged GitHub commit is not a Site deployment; root owns final preview, save/deploy and production readback for the prepared candidate.

Fresh native Sites readback confirmed the existing project `appgprj_6b01e9c6674c81918fb0a35a848478be` has **public audience revision 4**. Preserve its current owner and all existing grants, including arcologies and altologies. Public viewing does not grant mutation rights: the application allowlist remains the two requested developer identities.

At the earlier v2 observation, D1 was available, `/api/tasks` returned 401 without visitor identity, and the hosted game bundle matched its build manifest. Final production readback must separately verify the new release receipt, source-time cache behavior, playable assets, and private API access. A signed-in write and second-developer readback remain unverified.

## Apple access remediation completed

The user explicitly resumed Apple authentication. The new bundle, app record and app-specific App Store provisioning profile were created and verified; protected `testflight` environment configuration was completed without credential disclosure. Its main-only branch rule and owner review gate were preserved. The former HTTP 403 registration error and cancelled login are historical resolved blockers, not the current delivery state.

The signed release was dispatched from the reviewed source and passed the protected environment gate. No other app's profile or bundle was reused.

## Team and collaboration

| Identity | Current verified access |
| --- | --- |
| timelabs.ad | Google brief owner; Site owner/application developer; new Apple `DEVELOPER` invitation is pending acceptance, with visible apps verified as only Molecule Foundry and provisioning access disabled |
| arcologies | Google brief writer; Site/application developer; accepted Apple access with existing broader roles preserved; internal TestFlight group membership and Apple-reported installation verified |
| Additional Site viewer | altologies grant preserved; viewing does not add application write permissions |

The expired timelabs.ad Admin invitation was replaced only after fresh inspection. New app-scoped invitation evidence was verified at 06:35:20 UTC; expiration is 25 November 2026 at 06:34:44 UTC. The API omitted `allAppsVisible`; restricted scope is supported by the exact visible-app relationship and UI selection, not by an invented Boolean value. Acceptance is still pending.

GitHub's connected owner is serg-alexv. Exact GitHub login mappings for the two requested email identities remain unverified; do not infer them from similar names. Organization default repository permission was observed as admin, so use repository-only outside-collaborator write access once identities are established, rather than widening unrelated repository access.

The panel implements shared tasks, immutable configuration drafts, optimistic version checks, idempotency receipts and an attributable transactional journal. Saving a draft does not modify a shipped app. GitHub observations use fixed public endpoints; upstream failures remain explicit. There is no enrolled agent runner.

A signed-in production task creation, configuration save and second-developer readback remain acceptance tasks. Normal ChatGPT sign-in provides visitor identity. Service reads and fabricated identity headers are not substitutes for that test.

## Continuous work

The separate Molecule Foundry delivery automation is enabled hourly in Europe/Moscow. During this primary delivery session it is temporarily restricted to read-only monitoring until 09:00 UTC on 22 November 2026 or an explicit primary completion record. Preserve the single release owner and avoid duplicate source updates, dispatches or Apple mutations. Scheduled work is intermittent execution, not an always-running process.

## Next concrete actions

1. Publish this reviewed control-panel candidate through the existing Site, preserving public audience revision 4 and all grants; record its exact saved version, source and deployment receipt after production verification.
2. Exercise the installed build on a physical iPhone: complete a contract, inspect the controlled report/Notebook, release, purchase an upgrade, background/relaunch and restore the save.
3. Have timelabs.ad accept the scoped Apple Developer invitation; then verify accepted access and add that accepted identity to the intended tester group.
4. Complete signed-in two-developer collaboration acceptance and verify exact GitHub teammate identities.
5. Perform the uncoached first-player, accessibility, chemistry/statistics and performance reviews in AWARD_ROADMAP.md. Treat external beta distribution and any Apple Arcade proposal as separate subsequent milestones.

## Historical validation and provenance

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

See DESIGN_QA.md and docs/evidence for retained screenshots and earlier receipts. These observations predate the signed release above; an unsigned native compile alone did not establish Apple distribution.

## Historical post-PR #7 source and CI evidence

- [PR #7](https://github.com/timelabs-npo/molecule-foundry/pull/7) was technically reviewed with an accurately recorded `COMMENT`, passed its PR-specific checks, and merged into `main` commit **`dcad79cfaba3bb20ef597dc838408aba9548ca40`**. The merge changes only `apps/control/worker/index.js`, `apps/control/tests/control-api.test.mjs`, and `.github/workflows/control-validation.yml`; it does not alter game/native inputs, Apple release, authentication or access controls.
- The public GitHub observation cache now enforces source-time freshness for 20 minutes and a 60-second retry for an all-unavailable snapshot. This is a *tested source behavior*, not yet a measured production improvement.
- [PR native run 44979988430](https://github.com/timelabs-npo/molecule-foundry/actions/runs/44979988430) succeeded, including actual simulator launch and 1/1 XCTest. Its validated synthetic merge SHA was `64be1b8b71a55eb1d228b9ee1d261bca32e6b264`, version `0.1.0`, build `16.1`; device compile was **unsigned** (`CODE_SIGNING_ALLOWED=NO`). Original CI artifact 14737557563 was checked against SHA-256 `cefe7b71fae1be7fb26d7ad52e14c6645d8bbee7855acaf170039a3861f31cba`.
- [Main control run 44984666394](https://github.com/timelabs-npo/molecule-foundry/actions/runs/44984666394) passed with 14/14 control tests and 4/4 Sites tests. [Main native run 44984666400](https://github.com/timelabs-npo/molecule-foundry/actions/runs/44984666400) subsequently **passed** on exact `main` SHA `dcad79cfaba3bb20ef597dc838408aba9548ca40` (validate `success`, release `skipped`). The original [artifact 14738924958](https://github.com/timelabs-npo/molecule-foundry/actions/runs/44984666400/artifacts/14738924958) was downloaded and independently SHA-256 checked: `ccb6d79623b5f77c96669fca70687d4a6317d3a4db0fe4afff607ada5224d02d` (2,707,984 bytes). Original XCTest log: **1/1 passed, 0 failures**; simulator screenshot visually inspected. Version `0.1.0`, build `17.1`. iOS device compilation succeeded with `CODE_SIGNING_ALLOWED=NO` and there was no signed IPA, Apple upload or TestFlight.
- At this earlier checkpoint, hosting was **Site v2**, published from `3f18f744be8ea65c9ccb0a238bccaa17885eb10b`; merging PR #7 did not deploy the cache. The final release-publication candidate includes the reviewed cache source. Production observations and signed-in collaboration remain separate checks.
- At the earlier checkpoint, all gates after unsigned native validation were unverified and Apple authentication was paused after a cancelled handoff. The user explicitly resumed Apple access; the current verified release above supersedes those blockers.


Credentials must never appear in this checkpoint, screenshots, game source, shared document, or automation prompt.
