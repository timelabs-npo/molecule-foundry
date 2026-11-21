#!/usr/bin/env bash
# This workflow only signs the new Molecule Foundry bundle. Never enable shell tracing.
set -euo pipefail
cd "$(dirname "$0")/../.."
[[ "${GITHUB_REF:-}" == refs/heads/main ]] || { echo 'Release requires main.'; exit 2; }
for name in DEVELOPMENT_TEAM PRODUCT_BUNDLE_IDENTIFIER PROVISIONING_PROFILE_NAME APPLE_DISTRIBUTION_P12_BASE64 APPLE_DISTRIBUTION_P12_PASSWORD APP_STORE_PROFILE_BASE64; do
  [[ -n "${!name:-}" ]] || { echo "Missing protected release value: $name"; exit 2; }
done
[[ "$PRODUCT_BUNDLE_IDENTIFIER" == org.timelabs.moleculefoundry ]] || { echo 'Unexpected app identity.'; exit 2; }
mkdir -p build/release/export
if [[ "${UPLOAD_TO_TESTFLIGHT:-false}" == true ]]; then
  node scripts/release/apple-status.mjs app
fi
MOLECULE_SIGNING_WORK=$(mktemp -d "${RUNNER_TEMP:-/tmp}/molecule-signing.XXXXXX")
export MOLECULE_SIGNING_WORK
KEYCHAIN="$MOLECULE_SIGNING_WORK/molecule.keychain-db"
PROFILE_PATH=''
cleanup() {
  security delete-keychain "$KEYCHAIN" >/dev/null 2>&1 || true
  if [[ -n "$PROFILE_PATH" ]]; then rm -f "$PROFILE_PATH"; fi
  rm -rf "$MOLECULE_SIGNING_WORK"
}
trap cleanup EXIT
KEYCHAIN_PASSWORD=$(openssl rand -hex 24)
echo "::add-mask::$KEYCHAIN_PASSWORD"
python3 - <<'PY'
import base64,os
from pathlib import Path
root=Path(os.environ['MOLECULE_SIGNING_WORK'])
for env,name in [('APPLE_DISTRIBUTION_P12_BASE64','identity.p12'),('APP_STORE_PROFILE_BASE64','profile.mobileprovision')]:
    (root/name).write_bytes(base64.b64decode(os.environ[env],validate=True))
PY
security create-keychain -p "$KEYCHAIN_PASSWORD" "$KEYCHAIN"
security set-keychain-settings -lut 21600 "$KEYCHAIN"
security unlock-keychain -p "$KEYCHAIN_PASSWORD" "$KEYCHAIN"
security import "$MOLECULE_SIGNING_WORK/identity.p12" -P "$APPLE_DISTRIBUTION_P12_PASSWORD" -A -t cert -f pkcs12 -k "$KEYCHAIN" >/dev/null
security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k "$KEYCHAIN_PASSWORD" "$KEYCHAIN" >/dev/null
security list-keychains -d user -s "$KEYCHAIN" "$HOME/Library/Keychains/login.keychain-db"
IDENTITY=$(security find-identity -v -p codesigning "$KEYCHAIN" | awk '/[0-9A-F]{40}/ {print $2; exit}')
[[ ${#IDENTITY} -eq 40 ]] || { echo 'No usable signing identity.'; exit 2; }
security cms -D -i "$MOLECULE_SIGNING_WORK/profile.mobileprovision" > "$MOLECULE_SIGNING_WORK/profile.plist"
PROFILE_UUID=$(python3 - <<'PY'
import datetime,os,plistlib
from pathlib import Path
p=plistlib.loads((Path(os.environ['MOLECULE_SIGNING_WORK'])/'profile.plist').read_bytes())
assert p['Entitlements']['application-identifier']==os.environ['DEVELOPMENT_TEAM']+'.org.timelabs.moleculefoundry'
assert p['Name']==os.environ['PROVISIONING_PROFILE_NAME']
assert p['ExpirationDate']>datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
assert p['Entitlements'].get('get-task-allow') is False
assert not p.get('ProvisionedDevices') and not p.get('ProvisionsAllDevices'), 'App Store profile required'
print(p['UUID'])
PY
)
PROFILE_DIR="$HOME/Library/MobileDevice/Provisioning Profiles"
mkdir -p "$PROFILE_DIR"
PROFILE_PATH="$PROFILE_DIR/$PROFILE_UUID.mobileprovision"
[[ ! -e "$PROFILE_PATH" ]] || { echo 'Refusing to replace an existing profile.'; PROFILE_PATH=''; exit 2; }
cp "$MOLECULE_SIGNING_WORK/profile.mobileprovision" "$PROFILE_PATH"
BUILD_NUMBER="${GITHUB_RUN_NUMBER}.${GITHUB_RUN_ATTEMPT}"
export MOLECULE_RELEASE_BUILD="$BUILD_NUMBER"
xcodegen generate --spec apps/ios/project.yml --project apps/ios
if ! xcodebuild -project apps/ios/MoleculeFoundry.xcodeproj -scheme MoleculeFoundry -configuration Release \
  -destination 'generic/platform=iOS' -archivePath build/release/MoleculeFoundry.xcarchive \
  DEVELOPMENT_TEAM="$DEVELOPMENT_TEAM" CODE_SIGN_STYLE=Manual CODE_SIGN_IDENTITY="$IDENTITY" \
  PROVISIONING_PROFILE_SPECIFIER="$PROVISIONING_PROFILE_NAME" CURRENT_PROJECT_VERSION="$BUILD_NUMBER" \
  MARKETING_VERSION=0.1.0 archive > build/release/archive.log 2>&1; then
  tail -n 100 build/release/archive.log; exit 1
fi
APP=build/release/MoleculeFoundry.xcarchive/Products/Applications/MoleculeFoundry.app
codesign --verify --deep --strict "$APP"
python3 scripts/release/verify-app.py "$APP" --build "$BUILD_NUMBER" > build/release/archive-identity.json
python3 - <<'PY'
import os,plistlib
from pathlib import Path
options={'method':'app-store-connect','destination':'export','signingStyle':'manual','teamID':os.environ['DEVELOPMENT_TEAM'],
         'provisioningProfiles':{'org.timelabs.moleculefoundry':os.environ['PROVISIONING_PROFILE_NAME']},
         'manageAppVersionAndBuildNumber':False,'uploadSymbols':True}
Path('build/release/ExportOptions.plist').write_bytes(plistlib.dumps(options))
PY
if ! xcodebuild -exportArchive -archivePath build/release/MoleculeFoundry.xcarchive \
  -exportPath build/release/export -exportOptionsPlist build/release/ExportOptions.plist > build/release/export.log 2>&1; then
  tail -n 100 build/release/export.log; exit 1
fi
IPA=$(find build/release/export -maxdepth 1 -name '*.ipa' -print -quit)
[[ -n "$IPA" ]] || { echo 'Signed IPA not produced.'; exit 2; }
python3 scripts/release/verify-app.py "$IPA" --build "$BUILD_NUMBER" > build/release/ipa-identity.json
export MOLECULE_RELEASE_IPA="$IPA"
export MOLECULE_UPLOAD_ACCEPTED=false
if [[ "${UPLOAD_TO_TESTFLIGHT:-false}" == true ]]; then
  mkdir -p "$MOLECULE_SIGNING_WORK/private_keys"
  python3 - <<'PY'
import os,base64
from pathlib import Path
root=Path(os.environ['MOLECULE_SIGNING_WORK'])/'private_keys'
(root/('AuthKey_'+os.environ['ASC_KEY_ID']+'.p8')).write_bytes(base64.b64decode(os.environ['ASC_PRIVATE_KEY_P8_BASE64'],validate=True))
PY
  if ! API_PRIVATE_KEYS_DIR="$MOLECULE_SIGNING_WORK/private_keys" xcrun altool --upload-app --type ios \
    -f "$IPA" --apiKey "$ASC_KEY_ID" --apiIssuer "$ASC_ISSUER_ID" > build/release/upload.log 2>&1; then
    tail -n 70 build/release/upload.log; exit 1
  fi
  export MOLECULE_UPLOAD_ACCEPTED=true
fi
python3 - <<'PY'
import datetime,hashlib,json,os
from pathlib import Path
ipa=Path(os.environ['MOLECULE_RELEASE_IPA'])
receipt={'commit':os.environ['GITHUB_SHA'],'bundle_identifier':'org.timelabs.moleculefoundry','version':'0.1.0',
         'build':os.environ['MOLECULE_RELEASE_BUILD'],'signature_verified':True,'ipa_sha256':hashlib.sha256(ipa.read_bytes()).hexdigest(),
         'upload_accepted':os.environ['MOLECULE_UPLOAD_ACCEPTED']=='true','tester_access_verified':False,
         'observed_utc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
Path('build/release/release-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
PY
if [[ "$MOLECULE_UPLOAD_ACCEPTED" == true ]]; then
  node scripts/release/apple-status.mjs processing
fi
