# ChemLab 1.1.1 (build 3), web revision 26

This is a test release, not a signed store submission or final art approval.

## Changes

- Replaced the geometric river and vector bridge with irregular banks, original timber-bridge artwork, soil, rocks and reeds.
- Water depth blends gradually; downstream highlights pause in reduced-motion mode.
- River coordinates remain inside the reserved non-buildable corridor. Existing city saves and upgrade levels retain their coordinates.
- Versioned the offline asset graph and bundled the new original atlas for native builds.
- Android and iOS share version 1.1.1 and build number 3.

## Evidence

- All 88 unit tests passed, including full-map river containment and continuous bank widening. The current 10,000-session solver CI run also passed.
- Chromium browser checks at 375, 768 and 1440 pixels passed: city reward, relic, development path, city toggle and JSON backup; no JavaScript or failed-request errors observed.
- River/bridge screenshot inspected in the running renderer. Natural materials improve the rejected canal, but repeated bank patches and overall scene realism still need art iteration. No claim of visual parity with the reference.
- Offline Chromium reload passed: city opened and the new river atlas loaded from the release cache.
- Native CI run 38138038601 produced the Android debug APK / unsigned release AAB and iOS simulator app for commit b0f74e37aa724d0fd18c5ea9d6193823cab8d82d.

## Test package handoff

- Web: https://evgeniynekrashseo-sys.github.io/crystal-cave-game/?release=26
- Builds: https://github.com/evgeniynekrashseo-sys/crystal-cave-game/actions/runs/38138038601
- Android archive: artifact 11701552217 (`chemlab-android-unsigned`, includes APK and AAB).
- iOS simulator archive: artifact 11701262601 (`chemlab-ios-simulator`).

GitHub artifact download requires repository access and is subject to retention. These packages are for testing; use `docs/mobile/RELEASE.md` for signing and submission handoff.

## Release gates still open

Physical iPhone/Android checks (performance, touch, background/resume, sound, backup transfer and offline startup), Safari/Firefox coverage, final art approval, store screenshots from native devices, owner developer accounts, signing and store declarations. The iOS CI output is a simulator app, not an installable device IPA. Android release AAB is unsigned.

The 10,000-session solver run is automated puzzle coverage, not 10,000 human playtests.
