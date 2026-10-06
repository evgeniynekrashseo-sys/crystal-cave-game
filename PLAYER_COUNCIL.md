# ChemLab Continuous Player Council

This repository uses a repeatable virtual playtest council, not a claim of 10,000 human testers.

## Council
10,000 deterministic player sessions per cycle across 120 levels and six behavioral personas: optimizer, casual, explorer, speedrunner, chaos and completionist.

## Loop
1. Run the complete unit/regression suite.
2. Run the 10K player swarm against certified puzzles and chapter mechanics.
3. Aggregate failures by severity, level and seed.
4. P0 = release blocker; P1 = mandatory engineering/design review.
5. Developer fixes the smallest proven defect.
6. Preserve the canonical rules in CHEMLAB_GAME_LOGIC.md and the save key chemlab_v50.
7. Never alter approved tube/liquid assets merely to satisfy a subjective suggestion.
8. Rerun tests + 10K swarm after every patch.
9. Deploy only after regression is green.

## Specialist review lanes
- Gameplay engineer: solvability, move rules, progression, economy invariants.
- QA engineer: reproducibility, regression, input/double-tap/state corruption.
- Game designer: difficulty curve, boredom/friction, assist pressure, retention loop.
- UX designer: mobile readability, feedback, discoverability and control clarity.
- Visual designer: premium scene consistency; approved tube/liquid visual is locked.
- Performance engineer: frame-time, memory, asset loading and mobile stability.

Automated sessions are evidence generators. Subjective visual/retention recommendations require review and must not silently rewrite approved art or core logic.
