# Multi-cell plots (v44)
The simulation, map selection, access paths, collision checks and construction preview share settlement-footprints.js.

- Houses, wells and lighthouses keep a 1×1 land footprint; upgrades add capacity vertically.
- Fields: 2×2, 2×3, 2×4, 2×5, 2×6.
- Factories, smelters and energy plants: 2×1, 2×2, 3×2, 3×3, 4×3.
- Other compounds have type-specific size schedules in the shared module.
- Growth is anchored at the same north corner. Solid outline is current placement; amber dashed outline is level-five extent. Red cells indicate obstacles.
- Future land is not reserved and does not block initial placement. Upgrades validate the complete new footprint before charging resources.
- Roads, other buildings, water, unexplored territory, the delivery square and laboratory block expansion. Resource deposits remain protected.
- Relocation is explicitly confirmed, free, takes construction time, and preserves identity, level and crop progress. Active maritime teams prevent relocation.
- Old saves are migrated to explicit 1×1 legacy footprints to prevent overlaps. Their next upgrade or relocation uses the new planned footprint.
- Sprite bodies keep their proportions inside larger compounds; cultivated rows cover every field cell. This release does not replace the art collection.

Validation: 128 automated tests and scripts/footprints-browser-qa.cjs (mobile upgrade obstruction, relocation and save persistence).

