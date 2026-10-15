# ChemLab City — Reference Parity Production Loop

## Source of truth
Two original user-supplied medieval settlement screenshots in the ChatGPT conversation. Their original image files must be added as `references/reference-a.png` and `references/reference-b.png` for automated image comparison. **Do not use AI-generated concept art as a substitute.** Current reference assets are NOT in this branch.

## Virtual specialist team (roles, not hired staff)
1. Art director: approves framing, architectural era, silhouette, palette and similarity.
2. Environment artist: ground, grasses, shrubs, rocks, forest floor and blending.
3. Vegetation artist: tree species, varied silhouettes, transparent cutouts and believable shadows.
4. Architectural artist: building stages, stonework, timber, roof, props and scale.
5. Technical artist: atlas segmentation, alpha handling, perspective, lighting and mobile texture budgets.
6. Game/renderer engineer: connected roads, layering, sprite anchors, draw order and save compatibility.
7. Mobile engineer: iPhone safe areas, pinch/pan/tap, frame times and memory.
8. QA and visual regression reviewer: screenshots at matching viewports, difference maps, bug reports and acceptance gate.

## Iteration protocol
1. Capture baseline of the actual running sandbox on a phone-sized viewport.
2. Compare visually to the original references at comparable framing. Keep a written defect list ranked by visual impact.
3. Fix the highest-impact defect **in the implemented assets/rendering**, not merely in a separate concept.
4. Run unit tests and a real browser screenshot capture.
5. Inspect the new screenshots and annotate remaining mismatches.
6. Repeat until accepted by user. A claimed 100% pixel match is not realistic for independent rendered scenes; never fabricate a 100% score.
7. Only merge and publish after quality and functionality gates pass.

## Quality gates
- No rectangular backgrounds behind trees or sprite crops.
- No visible tile boundaries in terrain and roads.
- Roads must connect in isometric projection and follow coherent intersections.
- Houses match medieval reference in roof silhouette, stone/wood construction and scale.
- Tree species, ground and buildings share one light direction, shadow softness and palette.
- Touch interactions work on iPhone; test portrait 390×844 and landscape 844×390.
- No change to chemistry gameplay or save schema.
- Screenshots are stored as CI artifacts; reviewers must inspect them. **Screenshots alone do not constitute passing visual QA.**

## Technical stack
Existing Canvas 2D renderer and existing atlases first; use transparent WebP/PNG sprite layers, deterministic procedural detail, Canvas alpha masking, optional OffscreenCanvas, browser Playwright screenshots, GitHub Actions and Node test suite. New libraries are adopted only when they solve a measured bottleneck. Avoid a WebGL migration without a validated asset pipeline.

## Current blockers
- The two original reference images have not yet been committed as machine-readable reference files.
- No automated perceptual metric is configured; CI captures evidence but does not grade similarity.
- No autonomous artist/model generation service is connected to GitHub Actions.
- Scheduled CI can recheck and report, but cannot independently create high-fidelity new art without such a service.

## Definition of done
User explicitly approves side-by-side screenshots of the **running mobile game**, not a mockup; visual regression and functional checks pass.
