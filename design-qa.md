# ChemLab — detailed mobile settlement, release 16

final result: passed

No actionable P0/P1/P2 findings remain in the tested prototype. This is a local visual-and-interaction acceptance result, not an app-store certification or a claim that release 16 is publicly deployed.

## Findings and fixes

The initial build had P2 issues: intermittently missing resource/population icons, a timestamp colliding with the population area, undersized navigation labels, flat resource symbols, magenta transparency spill and a soft meadow texture. These were fixed and re-compared against the source.

Interaction testing also found two P2 defects: building-level text could be occluded by foreground scenery, and periodic-table click events were rendered as `[object PointerEvent]`. Levels now remain in the management sheet; both table handlers call the atlas without passing their click event. A regression test covers the table and back-button paths.

Remaining refinements are P3 and listed below. The simulation's layout and progress-dependent content are intentional differences, not falsely classified as pixel-perfect matches.

## Source, capture and normalization

- Source visual truth: `/workspace/scratch/ee83bc649bd6/crystal-cave-game/docs/design/reference-settlement-v16.jpg`, the user's selected 711 × 1536 image.
- Browser-rendered final implementation: `/workspace/scratch/ee83bc649bd6/crystal-cave-game/docs/design/settlement-v16-final.jpg`, 430 × 936 JPEG.
- Browser viewport: 1363 × 936 CSS pixels. The centred city stage is 430 × 936 CSS pixels at x=466.5, y=0; no browser chrome or surrounding desktop canvas is included.
- Capture density: one output pixel per CSS pixel in the explicit 430 × 936 clip.
- Source is downsampled proportionally to 430 × 929. Implementation is cropped to 430 × 929, removing 3 pixels at the top and 4 at the bottom. No phone bezel or status bar is part of either image.
- Full-view comparison: `docs/design/comparison-final-v16.jpg`, 860 × 929, source left and implementation right.
- Focused HUD comparison: `docs/design/comparison-final-hud-v16.jpg`, 860 × 135.
- Focused mission/navigation comparison: `docs/design/comparison-final-controls-v16.jpg`, 860 × 180; both regions start at normalized y=749.
- All three combined comparison images were opened together and inspected; source and implementation were present in the same comparison input.

### State differences

Both artifacts show the bright daytime city map with the City navigation state active, no open sheet and the default camera.

The source is an illustrative early settlement: 6/12 population, resource values 40/25/120, and an uncompleted clean-water mission. The first browser baseline was a fresh playable city with 6/8 population and the same clean-water mission. The final evidence is deliberately the tested, progressed city: 8/16 population, resources 362/335/0, one additional upgraded house and a working water facility. Its mission changes to “Нові відкриття” after the water technology is implemented.

Existing simulation coordinates and progression are retained. The laboratory sits further right, and player-built structures increase density. These content/state differences are explicit; no exact position or numerical fidelity is claimed.

## Required fidelity surfaces

| Surface | Assessment from full and focused comparisons |
| --- | --- |
| Fonts and typography | System sans-serif stack, strong compact ChemLab wordmark, cyan Lab, readable white resource figures and navy mission text preserve the source hierarchy. Navigation is 12 px rather than the initial 10 px; the subtitle is 12 px. Mission title is 18 px; secondary text is 11 px. No collision or unintended wrapping remains at the tested width. The source's slightly rounder lettering is a P3 refinement. |
| Spacing and layout rhythm | Inset navy/cyan HUD, dominant edge-to-edge map, lower pale mission card and four-button navigation recreate the mobile composition. The HUD is roughly 15 px taller than the scaled illustration, intentionally retaining touch-sized controls. Sheets scroll without covering persistent navigation. The map leaves room for expansion. |
| Colors and tokens | Navy, cyan, pale glass, golden resources, blue roofs and sunlit yellow-green meadow follow the target. Cyan selection and active-navigation states remain recognizable. Map-tool buttons have dark backgrounds and visible white icons. |
| Image quality and asset fidelity | Separate raster cottages, laboratory glass, field, residents, riverbank, bridge and nature retain the selected semi-realistic direction. New 3D resource PNGs replace flat symbols. Alpha spill is removed. Ground samples the clear interior of the supplied reference, excluding baked vegetation/shadows. Standard controls use licensed Phosphor icons, not custom SVG approximations. Their less glossy style is P3. |
| Copy and content | The initial clean-water title/subtitle match the source. Progress-dependent mission text is expected. Research separates the settlement need, exact game effect, chemistry and history. Na's card shows atomic number, mass, protons/electrons and a working comprehension question. No PointerEvent text remains. |

## Comparison history

| Iteration | Earlier finding and evidence | Fix | Post-fix evidence |
| --- | --- | --- | --- |
| Baseline | P2 missing HUD images, crowded time text, tiny labels, flat resources and alpha spill. `comparison-before-v16.jpg` pairs the source with `settlement-v16-before.jpg`. | Mount HUD imagery once and update numbers only; generated resource PNGs; time moved out of the visible header; larger labels; alpha cleanup. | Final full/HUD/control comparisons above. The intermediate HUD improvement is retained in `settlement-v16.jpg` and `comparison-v16.jpg`. |
| Interaction pass | P2 occluded level annotation in `settlement-v16-pre-terrain.jpg`; incorrect click-event text in the table's visible browser snapshot. | Keep level in the building sheet; wrap both atlas click handlers. | Final map contains no occluded level label. Browser sheet reports “Будинок · Р2”; table browser snapshot contains no PointerEvent. Regression test passes. |
| Terrain pass | P2 repeated baked shadow patches in `settlement-v16-terrain-before.jpg`. | Restrict the meadow sample to its clean interior at 40:25, 210 × 105. | Revised browser capture and final source/implementation comparison show no phantom shadow patches. |
| Final comparison | Rechecked all five fidelity surfaces at the same viewport; disclosed progress-state differences before judging. | No further visual fixes required. | `comparison-final-v16.jpg`, `comparison-final-hud-v16.jpg`, `comparison-final-controls-v16.jpg`. |

## Browser interactions tested

- Dismissed first-run instructions and opened City from the laboratory.
- Opened construction, selected a valid plot with the coordinate controls, and started a house.
- Observed scaffolding/countdown; housing increased from 8 to 12 after completion.
- Started and completed its upgrade; housing increased to 16. The management sheet correctly shows level 2.
- Implemented clean-water technology: research balance decreased from 2 to 0, and the water facility and clinic became available.
- Built the water facility; staffed operation raised the game's health indicator from 50% to 80% and happiness from 80% to 90%.
- Observed residents moving, resource delivery and subsequent population growth from 6 to 7, then 8.
- Exercised zoom in/out, map dragging and the centre-camera control; persistent HUD/navigation remained fixed.
- Tapped the water facility directly on the canvas; its management sheet opened with the correct building, level 1 and one assigned worker.
- Returned to chemistry, opened the periodic table and Na, and answered “Кількість протонів” successfully.
- Reloaded the ordinary local root route; buildings, technology and city progression persisted.
- Checked the browser error log after the final reload. Application errors: 0. The returned log entries were browser-extension metadata errors, not game errors.

Construction evidence: `docs/design/settlement-v16-construction.jpg`.
Research-sheet evidence: `docs/design/settlement-v16-research.jpg`.
The approved tube/liquid graphics were not changed; `liquid.js` only changes its import's release query.

## Automated validation and release preparation

- 38/38 tests pass, including level continuation, increasing difficulty, formula missions, liquid separation/physics, all 118 element cards, city construction, research, health, industry, routing and persistence.
- New tests cover stable HUD image mounting, periodic-table event handling and every cached release asset plus the complete versioned module graph.
- Syntax checks pass for city, HUD, renderer and expansion modules. `git diff --check` passes.
- HTML, styles, module imports and service worker consistently use release 16.
- Production PNGs and icons are present in the offline asset list. An actual offline/network-cut browser run was not performed.
- No push, GitHub Pages deployment or public-release verification was performed in this pass. The preceding public v15 QA is preserved as `docs/design/design-qa-v15.md`.

## Follow-up polish and test gaps

- [P3] Match the reference's glossy standard-control icon treatment more closely without replacing recognizable controls.
- [P3] Add more meadow variation to reduce the subtle mirrored texture repetition over large pans.
- [P3] Fine-tune source typography and HUD proportions on physical devices.
- Physical iPhone/Android testing, 320/390 px viewport emulation, safe-area behaviour and sustained frame-rate/memory checks remain outstanding. The available cloud browser used a fixed viewport with a 430 px mobile stage; read-only element evaluation intermittently timed out.
- Factory/truck production is covered by automated simulation tests, not by an end-to-end late-game browser playthrough in this pass.

## Implementation checklist

- [x] Source and browser implementation captured and normalized.
- [x] Full and focused side-by-side evidence inspected.
- [x] Actionable P0/P1/P2 findings fixed and re-compared.
- [x] Core city interactions and chemistry return verified.
- [x] Automated checks pass.
- [x] Working local preview kept open in the cloud browser.
- [ ] Publish release 16 only on the user's explicit publication request.
