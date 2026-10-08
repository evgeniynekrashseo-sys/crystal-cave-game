# ChemLab v25 release QA — 2026-10-08

## Verdict

Web release candidate passed the checks below. Native projects are prepared, not certified for store release. Store signing, physical-device QA and submission remain outstanding.

## Verified locally

- 86 Node tests passed: puzzle integrity, formula delivery, save migration, reward idempotence, city input/rendering, story conditions, backup validation, fractional production bonuses and geography regressions.
- 10,000 deterministic solver sessions across levels 1–120: zero reported core failures. These replay certified solutions; they are not human participants or genuinely different player strategies.
- Headless Chromium 131, widths 375, 768 and 1440 px (900 px height): laboratory, city and story views load; no JavaScript exceptions or HTTP errors; no horizontal body overflow in laboratory.
- At each width: claim the first story reward, collect its artifact, choose science, return to laboratory, disable/re-enable city, export a JSON backup. Story/path/artifact progress remained intact and the exported backup contained city data.
- Visually inspected laboratory, city and story screenshots. Existing tube art is preserved. New portrait and city UI render correctly in the inspected views.
- PNG integrity tests and `git diff --check` passed.
- `npx cap sync` completed for Android and iOS.

## Fixes made during QA

- User screenshot regressions: removed miniature building/energy sprites and cyan upgrade strips; river now uses the same water tiles as placement/pathfinding; bridge is a reserved traversable tile with a world-space deck, not a sprite containing a second baked-in river. Trees no longer spawn in the river and the laboratory is not walk-through. Resident scale is tied to the same world unit as buildings.

- Interpolated resident positions between simulation ticks and decoupled ambient animation from tick boundaries.
- Paused hidden laboratory liquid rendering while city is open.
- Retained fractional output so a 25% science bonus is not silently rounded away.
- Corrected voyage return notification to show awarded coins including bonuses.
- Updated story claim button when a requirement becomes satisfied.
- Added the canonical GitHub Pages URL; synchronized native version metadata to 1.1.0 (build 2).

## Remaining coverage / release gates

- Chromium automation does not verify Safari, Firefox, actual mobile touch hardware, GPU performance or accessibility conformance. No Lighthouse score or measured 60 FPS claim is made.
- The full-story unit test seeds required conditions to validate all paths and rewards. It is not a full-duration playthrough or proof of balanced progression.
- Automated backups validate JSON restoration, but native WebView download/import behavior requires real-device testing.
- Android compilation requires Java 21 and Android SDK 36; iOS compilation requires macOS/Xcode. CI workflows are provided; a successful sync is not a successful native build.
- Owner must confirm bundle ID, final seller/privacy declarations, developer accounts and signing identities before store upload. No paid services or store submissions have been initiated.
- Post-deployment verification must check GitHub Actions and the public URL; local results alone do not establish successful publication.
