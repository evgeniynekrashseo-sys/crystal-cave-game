# ChemLab
Mobile-first Ukrainian tube-sorting puzzle. Canonical rules: [CHEMLAB_GAME_LOGIC.md](CHEMLAB_GAME_LOGIC.md).

## Play / run
Serve `dist/` with any static web server, for example `python -m http.server 8080 --directory dist`. Open the local address. No runtime dependencies or API keys.

The GitHub Pages workflow tests and deploys `dist/` on pushes to main. Pages must use GitHub Actions as its source.

## Implemented
- Independent deterministic engine, verified reverse-scramble solution certificate for every level
- 3/4/5/6 active symbols (capped by discoveries), move budgets, undo, legal-move hints, one reserve tube, exact retry and anti-repeat
- Canonical `chemlab_v50` progression and rewards; separate cosmetic/sound preferences
- Ukrainian mobile UI, generated laboratory background, animated glass tokens, sound, haptics
- 118-cell periodic map with research quests and per-element recipe cards
- Fictional reactor: explosions, one-move freeze, gold deposits, crystals and artifacts
- Daily quests, laboratory upgrades, earned-crystal themes, and secret achievements
- Mastery cosmetics, installable web manifest and offline asset cache

Progress is local to the browser and origin. It is not synced between GitHub Pages and Sites. The current attempt resets on reload; earned progression persists. Hint follows the canonical first-legal-move rule, not an optimal solver. No payments, account system, advertising SDK or app-store package is included.

## Monetization
See [MONETIZATION_ROADMAP.md](MONETIZATION_ROADMAP.md). Purchases and ads are not live; this update adds the earned-currency economy and retention loops.

## Validation
`npm test` runs 250 deterministic puzzle certificates across all difficulty tiers plus legal-move, legacy-save, anti-repeat, all-118-element research, reward idempotency, freeze, daily reset, upgrade and map-coordinate checks. Native iOS/Android device QA, retention analytics and store submissions remain release work. No ranking or player retention claims are made.

## Art
`dist/lab.webp` generated using built-in imagegen for this project. Prompt: portrait premium stylized 3D fantasy laboratory, midnight navy and teal, brass details, cyan apparatus at far edges, arched window, dark central space for interactive tubes, dark stone workbench, no text/UI/central foreground tubes.
