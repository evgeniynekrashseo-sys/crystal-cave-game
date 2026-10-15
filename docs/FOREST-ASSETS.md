# Forest asset checkpoint — development preview only

## Provenance

- Source: https://polyhaven.com/a/fir_sapling_medium
- Modeling: Rico Cilliers. Photography: Rob Tuytel.
- Asset license: CC0, https://polyhaven.com/license
- Source metadata: https://api.polyhaven.com/files/fir_sapling_medium
- Imported source: `fir_sapling_medium_a_LOD0`, 685,046 triangles.
- Bark and twig normal textures shared with Poly Haven `fir_tree_01`; twig diffuse uses the sapling's own texture.
- Delivered derivatives: `dist/world3d/assets/fir/view-0.webp` through `view-7.webp`.
- These images are rendered from the licensed mesh, NOT copied from Poly Haven's website preview images.

## Runtime decision

Geometric simplification of the disconnected needles destroyed the silhouette even at 18–42k triangles. That experiment was rejected. The full model is baked into eight transparent 1024px views using Three.js, at 45-degree azimuth increments. Runtime uses spatially batched, camera-facing instances with view selection; geometry is two triangles per tree. Assets load locally, and the procedural forest remains available on network failure. No change to production gameplay, chemistry, or localStorage saves.

This is a view-dependent forest impostor, not a full freely viewable 3D tree. The current camera has a fixed elevation. View switching can still pop; baked lighting does not respond dynamically. These limitations must be addressed before calling the visual work complete.

## Acceptance status

Desktop/mobile-browser smoke tests: no JavaScript errors, no horizontal overflow. Representative 900px scene: 117 draw calls, 267,405 triangles, versus 6,892,019 triangles in the rejected geometric attempt. This is NOT a measured iPhone FPS guarantee.

Architecture, ground, water, moving characters and animals still do not meet the reference quality bar. This checkpoint must not replace the main game or be called an App Store / Play release.
