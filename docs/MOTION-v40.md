# Motion iteration v40

New transparent motion atlas: dist/city-motion-v40.webp, 1024 x 1536.
Generated using built-in imagegen, source generated_images/exec-a7688f65-2df6-40d2-aa18-1b460dfe2afc.png.
Prompt brief: 4 columns by 6 rows, realistic isometric village worker front walk,
back walk, four axe-swing phases, four muted olive log truck views, horse walk,
sheep walk/grazing; consistent scale, muted natural materials, transparent alpha,
no text/ground/shadows. Row frames are padded to common bounds to reduce scaling
jitter. Alpha checked at empty pixels. Original generator output retained.

Workers use actual simulation headings and distance-indexed gait. Truck front/back
views are mirrored for four directional combinations, replacing the blue truck.
Lumber workers use their real 60-second chopping timer; tree harvesting and stump
appearance are simulation-driven. Existing specialist/woman sprites are retained
rather than replacing every resident with one male model.

Indoor worker rendering interpolates toward the entrance during the first second
of work, hides them in the middle and reverses during the final second. Vehicles
remain outside. Farm and open workplaces are not hidden. This is a visual entrance
transition, not navigation through an interior. Entrances currently use a shared
anchor; per-building authored door coordinates are still needed.

Horses and sheep have four frames, bounded roaming and direction flips. Livestock
already baked into ranch artwork is not duplicated. This is not skeletal animation:
specialist directional atlases, wheel rotation, obstacle-aware wildlife, continuous
vehicle steering and full entrance authoring remain unfinished.

Validation: 102 tests including direction, entry/exit, outdoor visibility, reduced
motion and chopping phases. Mobile scene checked for JS errors and visual regressions.
