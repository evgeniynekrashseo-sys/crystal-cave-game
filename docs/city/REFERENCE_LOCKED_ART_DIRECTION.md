# ChemLab City — Reference-locked Art Direction
Status: approved direction, NOT a claim of completed artwork.

## Primary visual references
The two medieval village screenshots supplied by the user in the conversation are the **sole primary style targets** for terrain, trees, architecture, roads, vegetation, and overall rendering. If a newly created asset does not match them, it fails visual review. Do not substitute generic fantasy, low-poly, cartoon, futuristic, or unrelated city-builder art.

## Terrain
Organic ground with irregular contours, layered grass species, worn earth, moss, stones, fallen needles, vegetation clumps and non-repeating transitions. No green tile seams, flat polygon slabs or repetitive texture stamps.

## Trees and nature
Dense varied conifers with realistic branching, tiered needles, roots, shrubs, fallen wood, boulders and natural undergrowth. Scale variation and coherent lighting. No uniform cone-shaped pines.

## Architecture
Stone bases, weathered timber frames, thatch/shingle roofs, visible joints, chimney masonry, window recesses, porch supports, scaffold and construction supplies. Maintain the original screenshot's medieval architectural language, consistent building scale and isometric perspective. Building upgrades must change silhouette, construction materials and functional details, not merely tint or size.

## Roads and transport
Organic worn tracks, stone and dirt variation, wheel ruts, soft grass margins and connected intersections. Vehicles must fit the established world era and perspective; no anachronistic modern cars unless the game's actual era progression calls for them.

## Composition and rendering
Unified camera projection, scale, shadows, color temperature and level of detail across every asset. Preserve scene readability on phone screens. Avoid noisy clutter, exaggerated UI and inconsistent sprite edges.

## Evolution and animation
Per-building states: foundation -> timber frame -> roof assembly -> occupied building; then distinct upgrade architecture tiers 1–4 and future extension beyond 4 only with explicit gameplay integration. Add villagers and transport with consistent scale and physically plausible paths.

## Acceptance criteria
1. Side-by-side comparison to BOTH user screenshots at equivalent camera angle and zoom.
2. No conspicuous flat grass, generic cone trees, mismatched perspective or floating structures.
3. New assets must use the existing sprite/canvas pipeline unless a renderer migration is separately approved.
4. Maintain mobile performance, avoid expensive full-frame filters; reduce decorative density at lower settings.
5. No changes to approved chemistry tubes, liquid visuals or saved game state.
6. Do not merge/deploy until screenshots of the implemented game have been reviewed and approved.

## Current state
Art direction is defined; the existing in-game art does not yet meet this standard. Road microdetail code on this feature branch is a first implementation step, not evidence of full visual parity.
