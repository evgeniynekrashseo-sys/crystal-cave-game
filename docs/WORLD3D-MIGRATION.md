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

The procedural geometry remains a technical prototype and does not yet meet the user's forest-village references. Branch geometry now replaces conical foliage; roofs have layered shingles, stone foundations and gables. Generated surface maps improve material detail but are not a complete authored PBR asset set. No animated character/animal/vehicle models exist in this renderer. No gameplay editing or simulation is wired to it. Some building types intentionally fall back to provisional geometry. Existing river, harvesting plots, agents and later-stage facilities are not visually migrated. Road upgrades use dirt versus paving textures; level 3 does not yet have a separate visual. Ground elevation must be reconciled with simulation navigation before integration. The demo is not service-worker precached or an offline/native release.

Required asset pipeline: glTF 2.0 meshes, measured footprints and door sockets, roughness/normal/albedo material sets, texture atlases, level-of-detail geometry, rigged animation clips with shared metre scale. Validate the complete scene against the user's reference before promoting it. Do not use a single static rendered illustration as a replacement for the playable map.

## Verification

- 113 regression tests pass, including save immutability/scale, disconnected road gaps, coast height, all four road-facing entrances, finite construction geometry, normals, UVs and material batching.
- Chromium WebGL2 via SwiftShader: desktop 900×900 and mobile 390×844, orbit/zoom, no JavaScript errors or horizontal overflow.
- Fixture after spatial vegetation culling: nine structures; 160 render calls, 417,999 triangles in the desktop renderer counter. Before culling, 846,387 triangles were submitted. This is not a mobile performance pass; real-device profiling remains required.
- Visual inspection still fails final reference-quality acceptance. The optional `/city3d.html` workshop may be published for inspection, but must not replace the production game.

## Runtime provenance

Three.js 0.180.0 official npm distribution via jsDelivr (`build/three.module.js`, `build/three.core.js`, `LICENSE`), stored under `dist/vendor/three/`. All workshop mesh/material code is original procedural implementation. No reference screenshots are embedded in the game.

## Generated surface assets

Built-in imagegen was used for both material images. Outputs are converted to WebP for the project; the architecture atlas is divided into four equal quadrants by the runtime material loader. These are surface textures on geometry, not backdrop screenshots. Lighting/shadows remain real-time.

- `dist/world3d/meadow-albedo.webp`, source `generated_images/exec-8b71ad6e-71c3-46e5-9a6d-8b88eb7f7621.png`.
- `dist/world3d/architecture-surfaces.webp`, source `generated_images/exec-46a7c05e-7763-4656-8063-d7cb4928810c.png`.

Final meadow prompt:

> Use case: photorealistic-natural. Asset type: seamless tileable PBR base-color game terrain texture, a square covering 4 by 4 metres, strict orthographic straight-down flat scan. Natural European woodland meadow ground: fine short olive grass with irregular earth patches, tiny pale dry grass blades, bits of moss, subtle pebble grains and soil. Muted realistic brown olive palette, quiet natural variation, finely detailed at close range. Flat diffuse neutral overcast illumination, no directional shadows, no baked ambient occlusion, no sun highlights, no horizon, no trees, no large objects, no flowers, no pathways, no text, no grid, no borders. Edge-to-edge consistent texture that can repeat seamlessly. This is a material texture for a real-time 3D game, not an illustration of a scene. 1024 square.

Final architecture prompt:

> Use case: photorealistic-natural. Asset type: four square PBR albedo material swatches arranged in a strict 2 by 2 grid, 2048x2048, no gutters no borders no labels. Each quadrant is its own complete straight-on seamless material scan for realistic medieval village architecture. Top left: aged oak planks, vertical grain, fine cracks and knots, weathered warm grey brown. Top right: irregular hand-laid pale grey limestone blocks with thin earthy mortar, actual rough chipped stone detail. Bottom left: overlapping rectangular dark warm-grey slate roof shingles, weathered fine surface, horizontal courses. Bottom right: bundled old golden straw thatch with fine aligned fibers, muted natural straw brown. All four equally sized and perfectly edge aligned at exact image center, diffuse flat lighting only, no cast shadows, no perspective, no objects, no text. Natural low saturation, photogrammetry quality. These will be cropped as four material maps on real 3D buildings, not used as a scene image.
