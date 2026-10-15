# ChemLab City — Visual Quality Loop

## Goal
Replace the current city presentation with a coherent, premium, editable 3D settlement matching the approved medieval-isometric references. Do not modify approved tube/liquid art, puzzle rules, saves, or Mana Forge.

## Iteration loop (run on each candidate)
1. Inventory existing sandbox scene, renderer, assets, dependencies, camera, controls, and performance baseline.
2. Collect candidate licensed GLB/GLTF assets and PBR materials; record provenance, author, version, license, attribution, polygons, texture size and mobile budget in assets-manifest.json. Never download unverified binaries into production automatically.
3. Compose ONE reference-matched benchmark scene in the existing 3D sandbox: varied timber/stone buildings, detailed ground, vegetation, natural roads, correctly oriented characters and vehicles, consistent isometric perspective.
4. Produce comparable fixed-camera desktop and mobile screenshots against the approved reference.
5. Run tests, mobile FPS and memory checks, geometry/collision checks, image visual review and scene load checks.
6. Log mismatches and regressions in docs/city/ITERATIONS.md, prioritize the largest perceptual gap, fix and repeat.
7. Only propose a production merge when scene fidelity is approved, tests pass and existing game state is preserved.

## Acceptance gates
- No primitive-box substitute architecture.
- Consistent art direction, proportions, camera and scale.
- Editability: transforms, material swaps, scene serialization, asset replacement.
- Mobile performance measured, not assumed.
- No change to existing tube and chemistry visuals.
- No auto-merge of unreviewed asset licenses or visual regressions.

## Candidate sources (verify before use)
- https://github.com/mrdoob/three.js
- https://github.com/IceCreamYou/THREE.Terrain
- https://polyhaven.com/
- https://quaternius.com/
- https://github.com/TokisanGames/Terrain3D (Godot only; not directly interchangeable with Three.js)

## Status
Planning and integration audit. No claim of reference-level art or working production upgrade until benchmark is built and visually reviewed.
