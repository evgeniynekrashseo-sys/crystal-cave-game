# City renderer migration — development only

## Status

This is a working, isolated Three.js 0.180.0 WebGL2 workshop, **not the requested final art quality and not a release candidate**. Production still uses the v42 Canvas2D renderer. Do not replace it with this prototype automatically.

Run `npm run dev`, open `/city3d.html`. Open `/city3d.html?save=1` to inspect a read-only copy of an existing `chemlab_settlement_v2` city. Neither mode writes saves or runs production. The default fixture is a small development scene, not a new game.

## Implemented foundation

- Locally vendored, pinned Three.js with MIT license; no runtime CDN dependency.
- Orthographic 3D camera with pan, orbit and zoom.
- Shared physical scene scale: one simulation tile = eight metres.
- One light/shadow system for buildings, terrain and foliage.
- Continuous terrain mesh; road surface blends based on distance to connected road segments.
- Adjacent-road-facing building groups, including local door transforms.
- Distinct provisional geometry for fields, open sawmills, houses, barns, industrial chimneys, parks and wells.
- Foundation/frame/assembly geometry driven by construction progress.
- Instanced grass, trees and rocks; render-on-demand while scene is idle.
- Read-only snapshot boundary, disposal and WebGL context error handling.

## Explicit limitations / release blockers

The procedural geometry is a technical blockout. It does not meet the user's forest-village references. Conical foliage, generic roofs, terrain detail and the straight coast need authored replacements. No animated character/animal/vehicle models exist in this renderer. No gameplay editing or simulation is wired to it. Some building types intentionally fall back to provisional geometry. Existing river, harvesting plots, agents and later-stage facilities are not visually migrated. Road upgrades currently change colour, not actual paving materials. Ground elevation must be reconciled with simulation navigation before integration. The demo is not service-worker precached or an offline/native release.

Required asset pipeline: glTF 2.0 meshes, measured footprints and door sockets, roughness/normal/albedo material sets, texture atlases, level-of-detail geometry, rigged animation clips with shared metre scale. Validate the complete scene against the user's reference before promoting it. Do not use a single static rendered illustration as a replacement for the playable map.

## Verification

- Three world-space regression tests pass: save immutability/scale, disconnected road gaps, coast height.
- Chromium WebGL2 via SwiftShader: desktop 900×900 and mobile 390×844, orbit/zoom, no JavaScript errors or horizontal overflow.
- Fixture: nine structures; 739 render calls including shadow pass, 328,624 triangles. This is not a mobile performance pass; static mesh batching and real-device profiling remain required.
- Visual inspection explicitly failed final art-quality acceptance. Keep this branch separate from production.

## Runtime provenance

Three.js 0.180.0 official npm distribution via jsDelivr (`build/three.module.js`, `build/three.core.js`, `LICENSE`), stored under `dist/vendor/three/`. All workshop mesh/material code is original procedural implementation. No reference screenshots are embedded in the game.
