# Molecule Foundry: quality roadmap and editorial readiness

Updated: 2026-11-21. These are proposed team quality gates, not achieved results, Apple eligibility guarantees, or a promise of an award. Evidence must name a build, device, test method, and result. The release status remains in `SESSION_STATE.md`.

## Choose the right ambition

For a game, the relevant annual App Store recognition is **Game of the Year**. Apple’s editors select its App Store Awards; the published considerations emphasize technical innovation, user experience, design, and impact. Apple also lists game-specific featuring considerations, including gameplay, controls, art, audio, replayability, and performance. [Apple: Getting Featured](https://developer.apple.com/app-store/getting-featured/)

The **Apple Design Awards** are a separate recognition of design and technical achievement. This project’s clearest creative targets are Interaction and Delight and Fun, supported by Inclusivity. A readable scientific theme by itself is insufficient: the moment of changing a molecule and deciding what its uncertain evidence means must be unusually satisfying. This is our product judgment, informed by Apple’s published categories. [Apple Design Awards](https://developer.apple.com/design/awards/)

**Apple Arcade is a separate partnership conversation.** A TestFlight build is not acceptance into its catalog. Prepare a playable pitch only after the core game demonstrates its appeal. Apple’s own Arcade session describes its partnership model and an idea-submission route. [Apple Arcade: From concept to catalog](https://developer.apple.com/videos/play/meet-with-apple/244/)

## Gate 1 — A trustworthy device build

**Proposed acceptance:** install the exact TestFlight build on a physical iPhone; complete all three demo contracts; interrupt the game during formulation and during a trial report; force-quit, relaunch, and recover identical budgets and evidence. Repeat offline. Record the App Store Connect build identifier and the device/OS. Run the same critical flow on an iPad because the current target declares iPad support.

Resolve save persistence, scroll reachability, external reference links, safe areas, and background/foreground recovery before adding content. A successful web build or upload does not prove this gate.

## Gate 2 — The first ten minutes make sense

**Proposed acceptance:** observe 12 uncoached first-time players. At least 9 finish their first supported route within eight minutes; at least 10 can explain why zero observed adverse events do not prove zero risk. Record failures as design work, not player mistakes.

Show management’s numerical targets before spending starts. Keep archived reports readable after route changes. Explain each unfamiliar term at its first useful moment. Introduce the first functional-group change with a visible before/after comparison, then let players predict the next one. Distinguish a structural fact from a fictional effect without interrupting every action with a disclaimer.

## Gate 3 — A memorable interaction, not just a spreadsheet

Build a short, tactile batch reveal: follow the changed bonds, hear a restrained process sound, feel a distinct completion haptic, and inspect the resulting molecule. Keep process errors local and explainable. Add undo to route editing and a clear way to compare two candidates.

**Proposed acceptance:** every new contract has at least two meaningfully different viable approaches. Their cost, impurity, evidence, or effect trade-offs must matter. Expand from three to approximately twelve authored contracts only after the first three produce unprompted replays. Keep satire aimed at bureaucracy and management incentives; avoid using patients’ suffering as the reward spectacle.

## Gate 4 — Playable through different abilities and languages

Apple’s games guidance recommends customizable text, controls, motion, and sound; its accessibility guidance requires attention to people’s varied interaction needs. [Designing for games](https://developer.apple.com/design/human-interface-guidelines/designing-for-games/) · [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)

**Proposed acceptance:** complete one contract using VoiceOver without seeing the molecular diagram; all essential chemical changes have a readable verbal description. Verify larger text up to 200%, sufficient contrast, reduced motion, and a non-color cue for changed bonds and failed gates. Provide independent sound and haptic settings. Check English and Russian chemistry copy with a competent reviewer. Do not claim accessibility support in store metadata until tested against Apple’s corresponding evaluation criteria. [Larger Text criteria](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/larger-text-evaluation-criteria)

## Gate 5 — Earn scientific credibility

Commission separate chemistry and statistics reviews. Every reference structure and reaction card needs a versioned source and a clear scope statement. Preserve the separation in `SCIENCE_MODEL.md`: sourced structures, curated route abstractions, and fictional whole-candidate clinical profiles.

**Proposed acceptance:** no reviewer-blocking structure or teaching error; no UI path describes simulated people as real evidence; no structural fragment is presented as a universal drug-effect predictor. A comparison report must display denominators, controls, uncertainty, and the candidate/route it belongs to. Persistent upgrades must change a real game resource or capability, not manufacture scientific certainty.

## Gate 6 — Polish with measured budgets

**Proposed acceptance:** on the oldest supported test device, target a usable cold launch within two seconds and responsive route editing within 100 ms. During animated interactions, target the 60 Hz frame budget. Measure a 20-minute session for sustained responsiveness, thermal behavior, and battery impact. Run at least 100 scripted critical-flow sessions with no progression-blocking defect, and fix every reproduced player-blocking issue before widening the beta.

These are internal engineering targets, not Apple’s published award thresholds. Publish the device, OS, sample count, and measurement method alongside each result. Avoid unqualified reliability percentages from tiny samples.

## Gate 7 — Prepare a factual editorial pitch

After device validation and player feedback, prepare a concise pitch: the unusual decision loop, its most satisfying moment, what the player learns, evidence of accessibility, the team’s story, and a playable TestFlight link. Use actual gameplay captures. Separate completed features from the roadmap.

Submit a **Featuring Nomination** in App Store Connect for the planned launch or substantial update. Apple permits supporting links, including TestFlight links, and its help page recommends advance notice of at least three weeks; our planning target is four weeks or more. Featuring is editorial consideration, not an award application or guaranteed placement. [Nomination guidance](https://developer.apple.com/help/app-store-connect/manage-featuring-nominations/nominate-your-app-for-featuring)

## Operating rule for the solo developer

Keep one accepted build, one active product goal, and one visible blocker list in the control pane. Assign chemistry content, gameplay balance, accessibility, and release engineering to separate review roles even when one person fulfills several roles. Agents may prepare patches and evidence; exact build verification and provenance decide release status. Expand multiplayer, generative chemistry, and live content only when they improve a tested player need.
