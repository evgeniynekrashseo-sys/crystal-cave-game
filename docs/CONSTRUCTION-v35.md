# Construction pass, v35

Playable incremental work toward the requested city redesign, not a final art-quality or store release.

- New builds preserve a simulation start timestamp, rendering separate foundation, frame and assembly phases on the actual plot. Legacy saves infer the original 6-second build / 8-second upgrade duration.
- Upgrades retain the prior architectural stage behind scaffolding. The finished building is assembled upward, without shrinking or adding a second miniature house.
- Construction uses camera-projected stone courses, timber, supplies and progress bars; picking uses the visible construction bounds. Farm animals and building effects appear only after completion.
- Building yards now have soft elliptical earth transitions, streets show connected wheel tracks, and oak/birch share conifer directional shadows.
- Offline imports/cache advance together to v35; existing chemistry, saved positions, costs and completion times remain unchanged.

Validation: 92 automated tests pass, including resuming an in-progress build from a save, upgrading only after completion and legacy timestamp fallback. Browser construction fixture and mobile/desktop scene checks are recorded separately during release QA.

Known gap: procedural construction geometry and existing sprite architecture are still visibly below the user's realistic reference. This pass does not deliver the complete new terrain, coast, animation library, architectural set or signed native packages. Do not describe it as the finished city redesign.
