# Molecule Foundry

A chemistry-inspired iPhone puzzle game about making a molecule, learning from uncertain evidence, and living with the decision to release it.

**Version 0.1.0 · MIT · timelabs-npo**

## Playable foundation

The first demo contains three research contracts, eight transformation/process cards, four supported candidate structures, animated native haptic feedback, local saves, and persistent laboratory upgrades. The complete loop is contract → production route → test batch → controlled clinical simulation → reformulation or release → funding and consequences.

The molecule view renders curated atom/bond topology. Clinical effects and prices are explicitly fictional game values. This is not an arbitrary chemistry predictor or a medical/manufacturing tool. See [the model and sources](docs/SCIENCE_MODEL.md).

## Project surfaces

| Surface | Purpose |
| --- | --- |
| `packages/engine` | Pure deterministic TypeScript simulation and regression tests |
| `apps/game` | Playable React game, Product Design mobile preview, separate offline native export |
| `apps/ios` | SwiftUI / WKWebView application; bundled local game, native haptics, no network needed for play |
| `apps/control` | Developer console: live GitHub evidence, shared D1 tasks, versioned balance drafts, audit journal |
| `.github/workflows/ios-testflight.yml` | Simulator/device compilation, native UI gate, protected signed release |

The development brief is a shared [Google document](https://docs.google.com/document/d/1Jx7aEoU3TACKicCIo9mYfSomvmHpxe8fLPOMa970okE/edit).

## Development

Node 22.12+ or 24 is required. On a fresh checkout:

```sh
npm ci
npm test
npm run build:game
npm run build:ios-web
npm run build:control
npm test --workspace apps/control
```

For the mobile preview, run `npm run dev --workspace apps/game`. For the team console, run `npm run dev --workspace apps/control`. Local console preview is read-only and does not impersonate a hosted developer.

The offline native export uses a classic IIFE script to avoid module-origin ambiguity on the local custom URL scheme. XcodeGen consumes `apps/ios/project.yml` after `build:ios-web`. Build with Xcode 26.3 or a later compatible toolchain. Minimum supported OS is iOS 18.

## Release truth

The initial session verified a valid existing distribution identity and configured a protected `testflight` environment. The existing App Store Connect API key denied registration of the new Bundle ID (`HTTP 403`). Until new-app registration, the new provisioning profile, and App Store Connect app record exist, **TestFlight delivery is blocked**. A compiled simulator app is not an installable TestFlight beta.

Read [session state](docs/SESSION_STATE.md) and [release operations](scripts/release/README.md) for current evidence and the next step. Apple Arcade requires a separate selection process.

## Collaboration

The control plane records shared tasks and immutable balance drafts. Draft settings are not silently applied to shipped builds. GitHub remains the source of code and CI truth; release actions lead to the protected GitHub workflow. The console does not pretend to run autonomous agents or dispatch builds that it cannot authorize.

Changes should use feature branches, focused pull requests, and evidence from the affected checks. See [CONTRIBUTING](CONTRIBUTING.md), [AGENTS.md](AGENTS.md), and the [award quality roadmap](docs/AWARD_ROADMAP.md).

## License and assets

Original project code is MIT-licensed. Dependencies and the Product Design preview runtime retain their own licenses. The game icon is generated artwork. Skeletal formula graphics represent structured scientific data, not image-generated chemical truth. Apple and TestFlight are trademarks of Apple Inc.; this project is not endorsed by Apple.
