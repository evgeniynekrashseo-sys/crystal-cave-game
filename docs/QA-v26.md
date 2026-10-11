# ChemLab 1.1.1 (build 3), web revision 26

This is a test release, not a signed store submission or final art approval.

## Changes

- Replaced the geometric river and vector bridge with irregular banks, original timber-bridge artwork, soil, rocks and reeds.
- Water depth blends gradually; downstream highlights pause in reduced-motion mode.
- River coordinates remain inside the reserved non-buildable corridor. Existing city saves and upgrade levels retain their coordinates.
- Versioned the offline asset graph and bundled the new original atlas for native builds.
- Android and iOS share version 1.1.1 and build number 3.

## Evidence

- Previous 86 unit tests passed after renderer integration; two additional tests cover full-map river containment and continuous bank widening.
- Chromium browser checks at 375, 768 and 1440 pixels passed: city reward, relic, development path, city toggle and JSON backup; no JavaScript or failed-request errors observed.
- River/bridge screenshot inspected in the running renderer. Natural materials improve the rejected canal, but repeated bank patches and overall scene realism still need art iteration. No claim of visual parity with the reference.
- The previous native CI run 37765727127 passed both Android and iOS. The revised build must pass its own CI run before its artifacts are handed off.

## Release gates still open

Physical iPhone/Android checks (performance, touch, background/resume, sound, backup transfer and offline startup), Safari/Firefox coverage, final art approval, store screenshots from native devices, owner developer accounts, signing and store declarations. The iOS CI output is a simulator app, not an installable device IPA. Android release AAB is unsigned.

The 10,000-session solver run is automated puzzle coverage, not 10,000 human playtests.
