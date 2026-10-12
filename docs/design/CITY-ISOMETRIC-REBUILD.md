# ChemLab — City Isometric Rebuild Contract

## Visual defects confirmed from iPhone screenshots (2026-10-12)
- Multiple atlases with incompatible apparent camera angles and scale.
- Buildings lack coherent road-facing entrance alignment.
- Grass and shoreline material do not match building detail and lighting.
- Large HUD blocks obscure the playable city.

## Non-negotiable implementation constraints
- Preserve existing save keys, player resources, buildings, levels, quests and chemical gameplay.
- Preserve approved laboratory glass and liquid assets.
- Never rotate a flattened isometric building sprite to face another direction: this distorts the projection. Use direction-specific artwork instead.
- One world projection, one world-to-screen transform and one camera for terrain, roads, structures, residents and hit testing.
- Every structure has explicit footprint, visual anchor, entrance side and allowed orientation. A placement is valid only when footprint tiles are buildable and do not overlap roads, water or other structures.
- Road connectivity must be verified from the entrance to the city road graph, not inferred from sprite proximity.
- Draw-order should follow projected footprint depth, with explicit handling for tall structures and occlusion.
- Normalize sprite scale against footprint dimensions and keep contact shadow inside footprint.
- Use a coherent ground material, shoreline blend and sun direction across atlases.
- Existing saves must migrate deterministically without deleting or silently relocating buildings.

## Implementation phases
1. Audit each sprite atlas cell for projection direction, visible floor corner, ground contact and natural pixel dimensions; produce a compatibility table.
2. Add per-building footprint and entrance metadata to the city model. Separate simulation position from visual pivot.
3. Introduce directional atlas variants where required; never fake them with image rotation.
4. Introduce entrance-to-road paths and validated placement previews.
5. Improve terrain transitions, contact shadows, water/grass/road blending.
6. Reduce mobile HUD obstruction with collapsible resource and task panels.
7. Regression tests: save migration, road connectivity, footprint overlap, click hitboxes, pan/zoom, mobile layout, laboratory unchanged.
8. Publish only after passing QA, then verify the public GitHub Pages build and capture a mobile screenshot.

## Release acceptance
- Three screenshot-highlighted houses share coherent apparent projection and floor scale.
- No entrance terminates in grass or collides with another structure.
- No building occupies water or a road.
- No flattened sprite is rotated to simulate a new camera view.
- 375px mobile viewport keeps a useful playable map visible.
- Build passes existing test suite and the public deployment displays the new assets.

This file is a technical acceptance contract, NOT evidence that the rebuild is implemented or deployed.
