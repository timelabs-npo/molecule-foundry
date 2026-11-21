# Native delivery

The native app is `MoleculeFoundry`, bundle `org.timelabs.moleculefoundry`, version
`0.1.0`. It contains its game in `Game/native.html` and works without a server.
The development web panel is a separate surface and is not bundled into the app.

## What the workflow proves

Every main push and pull request runs the game tests, produces the offline web
bundle, compiles both simulator and unsigned device targets, checks the compiled
identity, launches an iPhone simulator, and runs a native UI test. That test must
find the actual game heading and first action in WebKit, open Notebook, and find
its heading. Screenshots and the `.xcresult` are preserved for review.

This does not establish physical-device performance, a complete player session,
Apple processing, or tester access. Those are separate observations.

## Requirements

- Node 22.12 or newer in the Node 22 line; CI uses Node 22.
- Xcode 26.3 on the macOS 15 runner, plus XcodeGen.
- A registered bundle ID for this app, its own App Store provisioning profile,
  and an App Store Connect app record for the same bundle.
- The protected GitHub environment `testflight`, restricted to `main`.

| Environment variable | Meaning |
| --- | --- |
| `DEVELOPMENT_TEAM` | Verified Apple team identifier |
| `PRODUCT_BUNDLE_IDENTIFIER` | Must equal `org.timelabs.moleculefoundry` |
| `PROVISIONING_PROFILE_NAME` | Name of this app's App Store profile |
| `APP_STORE_APP_ID` | Numeric App Store Connect record ID |
| `ASC_KEY_ID` | App Store Connect API key identifier |
| `ASC_ISSUER_ID` | App Store Connect API issuer identifier |

| Environment secret | Meaning |
| --- | --- |
| `APPLE_DISTRIBUTION_P12_BASE64` | Existing valid distribution identity |
| `APPLE_DISTRIBUTION_P12_PASSWORD` | Its import password |
| `APP_STORE_PROFILE_BASE64` | This app's Apple-issued App Store profile |
| `ASC_PRIVATE_KEY_P8_BASE64` | Authorized App Store Connect upload key |

Credentials are passed to the protected release job and an ephemeral keychain.
Private signing files and keychain are removed on exit. They are not artifacts.

## Run

Validation only:

```sh
gh workflow run ios-testflight.yml --repo timelabs-npo/molecule-foundry
```

Signed export after validation:

```sh
gh workflow run ios-testflight.yml --repo timelabs-npo/molecule-foundry -f export_ipa=true
```

Upload after validation and verification of the Apple app record:

```sh
gh workflow run ios-testflight.yml --repo timelabs-npo/molecule-foundry -f upload=true
```

The protected environment requires the release owner `serg-alexv` to approve
the exact workflow run. An already authorized operator using that account can
approve that run; no account-wide protection changes are needed.

The build number is the workflow run number plus its attempt, for example
`3.1`. `release-receipt.json` records the source commit, version, build, IPA
SHA-256, signature verification and whether Apple accepted the upload command.
`apple-processing.json` separately records Apple's observed processing state.
The processing check is bounded at ten minutes. A pending state is retained as
pending, and no tester-access claim is made by this workflow.

Before announcing TestFlight availability, confirm the exact Apple build is
`VALID`, its compliance requirements are resolved, it belongs to the intended
internal or external group, and that group's intended users can access it.
External testing may require Beta App Review. Apple Arcade consideration is a
separate submission and selection process.
