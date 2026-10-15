# City renderer audit — 2026-10-15

Inspected current main branch:
- dist/city.js imports drawSettlement from settlement-renderer.js.
- dist/settlement-renderer.js is a layered 2D isometric renderer using image sprite atlases (settlement-sprites-alpha.png, settlement-details-alpha.png), terrain imagery and canvas drawing.
- dist/settlement-camera.js implements custom 2D isometric projection and picking.
- dist/world-design.js supplies construction stages, families, elevation and scene depth.
- package.json has no Three.js or Babylon.js runtime dependency.
- Existing city model and progression must be preserved.

Decision: implement a separate opt-in 3D sandbox renderer rather than replacing the production canvas city. Build a world adapter from current city model to mesh entities. Keep the existing city available as fallback.

Next required implementation:
1. Locate sandbox entrypoint and existing testing route.
2. Implement opt-in Three.js scene with orbit/isometric camera, grid-to-world adapter and GLB loader.
3. Import verified licensed medieval architectural assets and PBR ground/foliage.
4. Add inspector with transform/material edits and JSON save/load.
5. Capture reference-aligned screenshots and performance benchmarks.

Do not claim a finished 3D upgrade yet.
