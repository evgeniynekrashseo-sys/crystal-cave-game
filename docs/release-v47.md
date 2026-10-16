# ChemLab v47 — verified scope

## Implemented
- Campaign grows from 12 to 20 quests, with chapters 4–6 following the beacon.
- Three explicit paid choices; persistent production bonuses; two epilogues.
- Milestones check finished buildings, actual crop cycles and completed voyages.
- Story objective is surfaced on the map HUD; crises keep priority.
- Shared .56 ground-axis contract matches the existing camera without moving saves.
- Equipment boxes, pipes, crates, logs and wheel axes use projected world coordinates.
- Offline module graph versioned together; no changes to approved chemistry artwork.

## Verification
- 142 Node tests.
- Mobile browser test: map objective → story → paid decision → disabled alternative → reward → next quest → saved state.
- Browser render of five factory levels, with screenshot inspection.

## Not complete / release-quality blockers
- Existing building sprites still have inconsistent camera/material detail. This release does not claim to correct their baked perspective.
- Generated factory concept atlas is deliberately NOT integrated: no calibrated foundation/door metadata, inconsistent views.
- Most compound levels still use existing building sprites rather than the approved industrial evolution.
- Equipment is procedural geometry, not final high-detail artwork.
- Full directional character/vehicle animation, device performance validation and store readiness remain outside this release's completed scope.

Next asset acceptance gate: align foundation corners and doorway on the actual .56 map axes; validate at all footprint levels and mobile zoom; retain stable human/door dimensions; provide movement layers; reject sprite sheets that fail before integration.
