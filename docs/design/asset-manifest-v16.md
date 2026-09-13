# ChemLab — settlement assets, release 16

Visual target: `reference-settlement-v16.jpg`, the selected 711 × 1536 mobile settlement image supplied by the user. Implementation keeps the approved laboratory tubes and liquid layers unchanged.

## Production assets

| File in `dist/` | Size | Use |
| --- | --- | --- |
| `settlement-sprites-alpha.png` | 1254 × 1254 | Sixteen separate building, nature, resident and vehicle sprites |
| `settlement-details-alpha.png` | 1254 × 1254 | Sixteen river, road, nature and construction sprites |
| `settlement-ground-v16.png` | 390 × 130 | Meadow texture cropped from the selected reference |
| `resource-wood-v16.png` | 160 × 160 | Timber HUD icon |
| `resource-food-v16.png` | 160 × 160 | Wheat HUD icon |
| `resource-coin-v16.png` | 160 × 160 | Gold-coin HUD icon |
| `icons/*.svg` | Vector | Official Phosphor duotone navigation and map-control icons |

The building atlas has, in row order: house, laboratory, wheat field, well; tree, rocks, lumber workshop, animal farm; clinic, granary, mine, factory; energy centre, two resident poses, truck.

The detail atlas has, in row order: river, bridge, water, river bend; straight path, curved path, T-junction, crossing; flowers, reeds, grass, berries; fence, scaffold, cargo, lantern.

Atlases are sliced once into tightly bounded transparent sprites, then positioned and animated independently using the live city simulation. The city is not rendered as one flattened settlement image.

## Image generation and integration

Generation mode: built-in ImageGen. The resource set was generated as three equal cells, then chroma-keyed, trimmed and padded to transparent 160 × 160 PNGs.

Resource prompt used:

> Three isolated premium semi-realistic 3D HUD resources—stacked timber logs, golden wheat sheaf, blank gold coin—in equal horizontal cells, warm rich materials and soft highlights, matching the settlement reference, solid #ff00ff background, no text or extra objects.

The building atlas reuses the preceding ChemLab art pass; the detail atlas was generated during this design implementation. Magenta backgrounds and spill were removed from the production alpha channels. No additional creative redraw was performed during the final browser-QA pass.

The ground texture is an integration crop of the supplied reference: 390 × 130 at x=150, y=180. Rendering samples its clear interior at x=40, y=25, width=210, height=105, excluding vegetation and baked shadows. Mirrored copies reduce hard tile boundaries without painting fake terrain in code.

Phosphor assets are from `@phosphor-icons/core` 2.1.1; the package licence is retained in `dist/icons/LICENSE`. Game-specific buildings and resources use raster artwork rather than emoji or handcrafted SVG substitutes.

## Behaviour attached to the artwork

- Residents move between actual workplaces and the central delivery square.
- Construction has translucent building art, scaffolding and a countdown.
- The laboratory bubbles; water glints move; working industry emits smoke.
- The selected building has a cyan ring. Building levels remain readable in the management sheet, not behind foreground scenery.
- Pan, zoom and centre controls operate on the live scene.
- Resource and population images mount once; recurring simulation updates change numbers only.
- Production assets and the complete release-16 module graph are included in the service-worker asset list.

## Verification evidence

The project-root `design-qa.md` records the final reference comparisons, browser interactions, automated tests and remaining physical-device checks. Release 16 is a local working prototype in this pass, not a claimed public deployment.
