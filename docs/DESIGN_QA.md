# Design and interaction verification

Observed during 21–22 November 2026. Working direction: Blue Hour Laboratory — deep navy, restrained cyan and amber, large headings, readable skeletal formulas, and clear budget separation.

## Visual evidence

The generated direction and the implemented first screen were inspected together. The app intentionally replaces the concept image's decorative molecule with the sourced isobutylbenzene topology. Its starting cost is $0.00 until the player selects an action. The first batch button is disabled until a valid route exists. The reference's invented date footer was replaced by a concise simulation label.

| Capture | Context |
| --- | --- |
| [iOS Workshop](evidence/ios-workshop.png) | Actual XCTest attachment, 1206×2622 pixels, native simulator |
| [iOS Notebook](evidence/ios-notebook.png) | Actual XCTest attachment after tapping Notebook |
| [Clinical report](evidence/clinical-report.jpg) | Interactive desktop browser test of the shared native game surface |
| [Project outcome](evidence/project-outcome.jpg) | Successful first-project decision and revealed model |
| [Control overview](evidence/control-overview.jpg) | Initial local control-panel inspection; later evidence-label fixes are documented below |
| [Final control overview](evidence/control-overview-final.jpg) | Local browser verification of the corrected native-workflow label, branch and source SHA |
| [Final balance draft](evidence/control-balance-final.jpg) | Local browser verification of matching contract defaults and equal-arm cohort guidance |

The mobile preview was inspected at its fitted 393×852 CSS device geometry, displayed at approximately 0.918 scale in the browser. This is a visual-direction comparison, not a claim of pixel-for-pixel equivalence to the generated image. The native captures provide independent real-device-geometry evidence. Physical iPhone installation, VoiceOver, large text and sustained performance have not yet been verified.

## Interaction results

The first project was completed through visible UI controls, using seed 42:

1. Select the aromatic core; open the transformation library. Unavailable actions explain their prerequisite.
2. Add the carbonyl arm, reduce it to an alcohol, add the acid anchor, and purify.
3. Run the batch: unit cost $0.27; research cost 345 credits; simulated purity 99%; candidate MF-R1.
4. Run a controlled cohort of 480 total participants: 240 candidate and 240 control. Observe denominators, uncertainty intervals, and the smaller co-medication subgroup.
5. Expand the uncertainty disclosure. Response was 187/240 versus 63/240; serious events 0/240 still had a nonzero upper confidence limit.
6. Finalize: score 73/100 and 1784 laboratory credits; the authored population probabilities become visible.
7. Buy Structural preview for 900 laboratory credits. Reload the page and verify 884 credits, Installed status, and one completed contract.

The complete three-contract campaign is additionally covered by the deterministic engine suite. This browser session did not manually complete all three contracts on a physical device.

## Defects corrected

- A duplicate React version caused invalid-hook errors in the initial preview; workspaces were aligned to React 19.2.7.
- The native library bundle retained `process.env.NODE_ENV`, which would crash before rendering. Production substitution fixed it, and both native and hosted packagers now reject unresolved `process.env` references.
- Workshop density initially hid the primary action behind navigation; spacing and molecule bounds were corrected.
- Scroll position is reset when the selected section or game phase changes.
- Numerical management targets are available before spending, and archived route evidence remains readable.
- The control panel now distinguishes the latest native workflow from unrelated successful workflows and displays its actual branch and SHA.
- Initial balance-draft values match First relief; odd cohort sizes are rejected because the demo uses equal arms.

The mobile preview shell showed a simulated keyboard/outer-scroll artifact during automatic scroll-to-element interactions. It was not observed on the separate native surface or in the XCTest attachments. Protected preview-runtime files were preserved; physical touch and accessibility testing remain explicit follow-up work.

## Native provenance

[Run 44940427388](https://github.com/timelabs-npo/molecule-foundry/actions/runs/44940427388) passed on source head 7410fc5aac1082ac85748b1edfbb3c3f5af3a8ea, tested merge candidate 8113b13c039356ab405859d883f55b63940273e3. Its identical source tree was merged as 224350a10e41ee2c2aaf9397e7db3d73666b602c. The retained [receipt](evidence/native-validation-44940427388.json) and [artifact index](evidence/native-evidence-44940427388.json) record the exact build and archive checksum. The index's original image filenames refer to the downloaded CI archive; their repository copies are the two iOS images above.

Simulator and unsigned-device compilation passed. Signing and TestFlight upload were skipped because new-app registration remains blocked. No claim of App Store approval or tester installation follows from these captures.

## Hosted verification

Sites version 1 was published successfully on 21 November 2026. A supported service-authenticated read verified `/api/overview` HTTP 200, D1 available with zero task/config rows, `/play/` HTTP 200, and a 248112-byte game bundle matching SHA-256 074297ffe2213e0709a913a1163fbc63c430314f5a1ba8d466248ec338d685b4.

GitHub repository, commit and workflow observations were real. Some branch/issue requests were rate-limited and were shown as unavailable. `/api/tasks` correctly returned 401 without a visitor identity. Service access does not supply user identity; no identity headers were fabricated. A signed-in production task creation, configuration save and second-user readback are still required to close collaborative acceptance.

Version 2 was published on 22 November 2026 at 00:18:22 UTC from Site source commit `3f18f744be8ea65c9ccb0a238bccaa17885eb10b`, deployment `appgdep_6b0234c3a5f481918ec3fc4e71acc076`. It includes the corrected native-workflow label, contract defaults, even-cohort validation, explicit blocked Apple release evidence and the reviewed dependency updates. The current custom audience was preserved. The two final control screenshots above show local browser acceptance of these changes; they do not claim an authenticated production write.

A post-deployment service read at 00:18:42 UTC verified `/api/overview` and `/play/` HTTP 200, available D1 storage, the new blocked-release receipt and a 248007-byte game bundle with SHA-256 `24fa6a0e03d438b001d70bd13bbf3b3225d6acedc36289320a86f554f8d2fcdc`, exactly matching the local export and deployed manifest. `/api/tasks` still correctly returned 401 without visitor identity. All five GitHub data requests were rate-limited at this observation and reported unavailable; the integration does not synthesize replacement data.
