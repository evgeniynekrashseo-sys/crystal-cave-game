# ChemLab 1.2.0 (build 4) — coastal city release candidate

Reference: four user-supplied screenshots of a naturalistic 3D coastal village. This release is an original 2D isometric interpretation of its material and scale direction, not an exact recreation or 3D conversion.

## Visual integration

- Two original 4×4 transparent atlases (`dist/coastal-settlement-v27.png`, `dist/coastal-infrastructure-v27.png`) replace the mixed village architecture: sod-roof timber homes, lumber mill, quarry, farm, school, market, production buildings, laboratory, well, granary, clinic, harbor, lighthouse, observatory and greenhouse.
- Mature homes use a larger longhouse; sites under construction display a timber frame rather than a duplicate house under miniature scaffolding. Roads use earth colours; sea uses subdued blue-gray; coast has physical cliff sprites; forests use conifers and stone outcrops.
- Cell rendering, world position, resources, collision, story progress, building levels and save format are unchanged. The approved chemistry tubes and their liquid art are untouched.
- Laboratory level status is a single 62px disclosure row. Bonus objective, mission queue, chapter and mechanic tags live in its scrollable dropdown. The row keeps collection and remaining moves visible while leaving the tubes unobstructed; reaction controls appear in the dropdown when a mission starts.
- Asset prompt: naturalistic Nordic-coastal 3/4 isometric cutouts, consistent one-tile scale, timber/stone/moss, transparent cells, no text or ground; second pass matched laboratory, infrastructure and construction states. Generated with the built-in image generation tool. Atlases are integrated in `dist` and pre-cached offline.

## Verification

- All 21 Node test files pass, including persistence, construction, river geometry and offline module graph.
- Chromium 375/768/1440 browser walkthrough checks the lab panel layout, story reward, relic, path, city toggle and JSON backup without horizontal overflow or console errors.
- Offline Chromium reload opens city and fetches new atlas from the release cache.
- On-device iPhone/Android validation, GPU/memory/thermal profiling, Safari and native screenshot sets remain required before public store release.

## Store handoff

Android application ID `com.digitaldavinci.chemlab`; iOS bundle ID same. Version 1.2.0/build 4. Native GitHub workflow should produce a debug APK, unsigned AAB and iOS simulator app. These are test artifacts. Google Play requires a release AAB signed with an owner-held upload key; Apple requires an Xcode archive signed under the owner's Apple Developer team. Do not submit the CI simulator output as an App Store IPA.

The publisher account name Black Orange Groupe does not automatically change the immutable application ID. Confirm application ownership and final store identity before first submission. Final art sign-off and real device QA are still open gates.
