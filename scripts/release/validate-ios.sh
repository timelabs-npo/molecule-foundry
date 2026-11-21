#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
OUT="$PWD/build/release"
mkdir -p "$OUT"
BUILD_NUMBER="${GITHUB_RUN_NUMBER:-1}.${GITHUB_RUN_ATTEMPT:-1}"
test -f apps/ios/Resources/Game/native.html || { echo 'Build the offline game first.'; exit 2; }
xcodebuild -version > "$OUT/xcode-version.log"
xcodegen generate --spec apps/ios/project.yml --project apps/ios
compile() {
  local destination="$1" derived="$2" logfile="$3"
  if ! xcodebuild -project apps/ios/MoleculeFoundry.xcodeproj -scheme MoleculeFoundry \
    -configuration Release -destination "$destination" -derivedDataPath "$derived" \
    CODE_SIGNING_ALLOWED=NO CURRENT_PROJECT_VERSION="$BUILD_NUMBER" MARKETING_VERSION=0.1.0 \
    build > "$logfile" 2>&1; then
    tail -n 100 "$logfile"; return 1
  fi
}
compile 'generic/platform=iOS Simulator' build/SimulatorData "$OUT/simulator-build.log"
compile 'generic/platform=iOS' build/DeviceData "$OUT/device-build.log"
SIM_APP="$PWD/build/SimulatorData/Build/Products/Release-iphonesimulator/MoleculeFoundry.app"
DEVICE_APP="$PWD/build/DeviceData/Build/Products/Release-iphoneos/MoleculeFoundry.app"
python3 scripts/release/verify-app.py "$SIM_APP" --build "$BUILD_NUMBER" > "$OUT/simulator-identity.json"
python3 scripts/release/verify-app.py "$DEVICE_APP" --build "$BUILD_NUMBER" > "$OUT/device-identity.json"
SIMULATOR_ID=$(xcrun simctl list devices available -j | python3 -c '
import json,sys
d=json.load(sys.stdin)
rows=[x for runtime,items in d["devices"].items() if ".iOS-" in runtime for x in items if x["name"].startswith("iPhone")]
assert rows,"No available iPhone simulator"
print(next((x for x in rows if x["state"]=="Booted"),rows[0])["udid"])
')
xcrun simctl boot "$SIMULATOR_ID" 2>/dev/null || true
xcrun simctl bootstatus "$SIMULATOR_ID" -b > "$OUT/simulator-boot.log" 2>&1
xcrun simctl install "$SIMULATOR_ID" "$SIM_APP"
xcrun simctl launch "$SIMULATOR_ID" org.timelabs.moleculefoundry > "$OUT/simulator-launch.log"
sleep 5
xcrun simctl io "$SIMULATOR_ID" screenshot "$OUT/simulator-launch.png"
if ! xcodebuild test -project apps/ios/MoleculeFoundry.xcodeproj -scheme MoleculeFoundry \
  -configuration Release -destination "platform=iOS Simulator,id=$SIMULATOR_ID" \
  -derivedDataPath build/SimulatorData -resultBundlePath "$OUT/NativeUITests.xcresult" \
  -only-testing:MoleculeFoundryUITests CODE_SIGNING_ALLOWED=NO \
  CURRENT_PROJECT_VERSION="$BUILD_NUMBER" MARKETING_VERSION=0.1.0 \
  > "$OUT/native-ui-tests.log" 2>&1; then
  tail -n 100 "$OUT/native-ui-tests.log"; exit 1
fi
ditto -c -k --keepParent "$SIM_APP" "$OUT/MoleculeFoundry-Simulator.zip"
export MOLECULE_VALIDATION_BUILD="$BUILD_NUMBER"
python3 - <<'PY'
import json,os,datetime
from pathlib import Path
receipt={"commit":os.environ.get("GITHUB_SHA"),"build":os.environ["MOLECULE_VALIDATION_BUILD"],
         "observed_utc":datetime.datetime.now(datetime.timezone.utc).isoformat(),
         "simulator_compiled":True,"unsigned_device_compiled":True,"simulator_launched":True,
         "offline_game_ui_and_notebook_verified":True,
         "physical_device_tested":False,"testflight_uploaded":False,
         "screenshot":"simulator-launch.png","screenshot_review":"requires human or visual inspection"}
Path("build/release/native-validation.json").write_text(json.dumps(receipt,indent=2)+"\n")
print(json.dumps(receipt))
PY
