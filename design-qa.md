# Settlement and formula missions — QA checkpoint

final result: blocked

Source visual truth: /workspace/scratch/ee83bc649bd6/generated_images/exec-1525edf4-cbe3-42aa-9950-8b75509332be.png (853 × 1844 pixels).
Target viewport: mobile 390 × 844 CSS pixels; desktop responsive map.
State: early settlement, collapsed construction panel.
Implementation screenshot: unavailable.

Browser verification was attempted through the prescribed cloud browser. Navigation returned ERR_BLOCKED_BY_CLIENT; the subsequent inspection was explicitly rejected by the Cloud browser URL policy. No alternative browser, proxy, or indirect rendering was attempted. Visual comparison, actual touch interactions, animation appearance/performance, console inspection, full-view and focused-region comparison remain unverified.

## Findings
- P1 / release gate: browser-rendered evidence is unavailable. Do not claim visual fidelity or mobile QA. The user explicitly authorized publishing without the blocked check on 2026-09-12; publication is permitted but is not verification.
- Source sprites are extracted at runtime from the approved image. Starter buildings, meadow texture and villagers reuse the reference pixels. Later industrial buildings currently reuse those starter sprites; unique modern buildings need a subsequent art pass. Image generation returned a usage limit, so no new atlas was produced.

## Fidelity surfaces
- Typography: system sans-serif, large ChemLab header, compact resource counters; visual comparison pending.
- Spacing/layout: map fills the screen; resource header and bottom dock overlay it; construction/research use a collapsible sheet. Safe-area padding included. Browser overflow/tap-target verification pending.
- Colors: daylight grass, navy/cyan header, pale translucent controls, matching the source palette direction. Comparison pending.
- Image quality: original 853 × 1844 source retained; runtime polygon masks isolate actual source imagery. Mask edges, repeated meadow texture and building scale need visual inspection.
- Copy: Ukrainian labels, actual resource counters, research prerequisites, formula objectives and simplified chemistry explanations.

## Verified without a browser
- Unit tests exercise deterministic puzzle solvability, modifiers, formula atom counts, single-atom transfers, and mission solvability through level 100.
- App integration test executes actual app click handlers through sorting, formula collection, undo, impurity clearing, city delivery, win modal and next-level start using a minimal DOM test fixture. This is not browser QA.
- Settlement tests cover worker movement and deliveries, input-dependent industry, roads/trucks, upgrades, expansion, births, chemistry rewards, idempotent discoveries and persistence.
- Tube renderer, liquid physics and glass art were not redesigned.

## Remaining gate
Open the running app in an authorized browser, compare the mobile settlement with the selected source, exercise construction/upgrade/research/return-to-chemistry and a formula mission, and inspect console errors. Record captures and fix material findings before changing final result to passed.
