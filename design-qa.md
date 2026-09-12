# Settlement art, city research and element cards — design QA

final result: passed

Source visual truth: `/workspace/scratch/ee83bc649bd6/generated_images/exec-1525edf4-cbe3-42aa-9950-8b75509332be.png` (853 × 1844 pixels).
Implementation evidence: `/workspace/scratch/chemlab-public-v15-1789246829362.jpg` and `/workspace/scratch/chemlab-element-card-v15-1789246844376.jpg`.
Verified URL: `https://evgeniynekrashseo-sys.github.io/crystal-cave-game/`.
Verified release: `v15`, commit `524b6e9d94f10cae852872d62e0a075eb1f59c60`.

## Browser comparison

- The public settlement uses the bright meadow, cyan/navy ChemLab shell and pale glass controls from the selected direction. It avoids the rejected dark, visually crowded treatment.
- The 4 × 4 atlas provides distinct high-detail cottages, laboratory, field, well, resources, production buildings, residents and truck. Buildings are independent simulation objects rather than a flattened town image.
- The map preserves a strong focal cluster around the chemistry laboratory while leaving sufficient open land for expansion. Resource HUD, mission card and navigation remain readable above the map.
- Research opens as a legible responsive sheet. Each card now separates the settlement need, exact game effect, chemistry context and historical context.
- Element cards use the existing dark laboratory language and show a strong element symbol, atomic data, a short factual lesson and an unscored comprehension check.
- The approved test-tube and liquid design was not changed.

## Interaction evidence

- Opened the production city from the chemistry HUD.
- Opened construction, selected a house, moved away from the protected central square, started construction, observed the translucent countdown state, and confirmed completion plus housing increase from 8 to 12.
- Observed residents moving and resource totals changing while the city was active.
- Opened the detailed research panel and confirmed the new benefit/science/history structure.
- Returned to chemistry, opened the periodic table, opened Na, and answered the atomic-number question successfully.
- Production console contained no application errors. Logged errors came only from the cloud-browser extension.

## Publication issue found and fixed

The first successful GitHub Pages deployment exposed the new atlas, but unversioned module URLs were still served from the Pages CDN cache. The production page therefore mixed the old city module with new assets. Release v15 versions the HTML entry point, stylesheets, complete ES-module graph and service worker. The ordinary public URL now resolves `app.js?v=15` and the detailed city research UI.

## Validation

- GitHub Pages workflow completed successfully.
- 35/35 automated tests pass, including level continuation, formula missions, all 118 element cards, city simulation, construction, industry, routes, discoveries and persistence.
- Cloud browser viewport was 1363 × 936. Mobile-specific 390 × 844 emulation was unavailable in this browser session; mobile CSS and touch-sized controls remain covered by the responsive implementation but should still receive a final physical-device pass before an app-store release.
