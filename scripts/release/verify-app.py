#!/usr/bin/env python3
"""Check the actual compiled app or IPA, not just source build settings."""
import argparse
import json
import plistlib
import zipfile
from pathlib import Path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("path", type=Path)
    parser.add_argument("--bundle", default="org.timelabs.moleculefoundry")
    parser.add_argument("--version", default="0.1.0")
    parser.add_argument("--build", required=True)
    args = parser.parse_args()
    if args.path.suffix == ".ipa":
        with zipfile.ZipFile(args.path) as archive:
            roots = [n for n in archive.namelist()
                     if n.startswith("Payload/") and n.count("/") == 2 and n.endswith(".app/Info.plist")]
            if len(roots) != 1:
                raise SystemExit("Expected exactly one primary app in the IPA")
            info = plistlib.loads(archive.read(roots[0]))
            root = roots[0].removesuffix("Info.plist")
            has_game = root + "Game/native.html" in archive.namelist()
    else:
        info = plistlib.loads((args.path / "Info.plist").read_bytes())
        has_game = (args.path / "Game/native.html").is_file()
    expected = {"CFBundleIdentifier": args.bundle, "CFBundleShortVersionString": args.version,
                "CFBundleVersion": args.build}
    for name, value in expected.items():
        if str(info.get(name)) != value:
            raise SystemExit(f"Compiled identity differs: {name}")
    if not has_game:
        raise SystemExit("The compiled app is missing its offline Game/native.html")
    if info.get("ITSAppUsesNonExemptEncryption") is not False:
        raise SystemExit("The compiled app must state its export-compliance value explicitly")
    print(json.dumps({"bundle": args.bundle, "version": args.version, "build": args.build,
                      "offline_game_present": True, "identity_verified": True}))


if __name__ == "__main__":
    main()
