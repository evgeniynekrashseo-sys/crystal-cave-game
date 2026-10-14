# Screenshot-driven scene fixes v37

- Ranch: render the existing integrated stable/pen/livestock sprite once, at its full ground anchor. Removed the second oversized fence and duplicate animated herd. The ranch livestock baked into the artwork are static; farm chickens remain animated.
- Street props: lantern, lamp and cargo scale with world units. Their decorative locations are omitted on occupied building/road plots.
- Depth sorting: compare the actual ground-contact anchors (building front corner versus resident/plant feet), not raw object origins.
- Roads: bevel exposed ends; retain exact shared-width connectors only toward real road neighbors. No changes to saved road coordinates or routes.
- Relics: omit world decoration on occupied plots so a crystal/garden cannot draw through a house. Collection remains available through the existing History artifact cabinet, including for legacy saves.

Validation: original 92 tests passed; two additional regressions cover duplicate ranch layers and resident/building depth ordering. Mobile scene smoke test uses the existing mature-save fixture. These corrections address the supplied screenshot; they are not a claim that all game bugs are resolved.
