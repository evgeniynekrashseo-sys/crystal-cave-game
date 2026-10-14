# Production and functional art, v38

Implemented: separate crop-field, sawmill, brick factory, research laboratory,
four park appearances and four ranch appearances. Fields/parks no longer use
house construction scaffolding. Existing homes retain their previous tier art.
Includes pending v37 scene anchor, street prop scale, ranch duplication and relic
occlusion fixes. Chemistry visuals are unchanged.

New construction takes 14–75 simulation seconds by type; upgrades multiply base
time by 1 + (level - 1) * 0.4. Existing in-progress saves retain their deadlines.
Lumber workers walk to an available forest plot, chop for 8 seconds, return logs
to their mill, process for 6 seconds and deliver wood to the warehouse. A harvested
plot regrows after 240 simulation seconds. Harvest timestamps survive saves.
Blocked/exhausted forests cannot produce free wood; retries are throttled.

Validation: 95 existing tests plus 3 new forestry/production regressions pass.
375px browser fixture: no uncaught errors; mature scene inspected visually.

Not complete: lakes, natural coastline redesign, unique art for every production
upgrade, further house variety, actual axe/log carrying sprites and native store
release/signing. This is a web iteration, not a finished store release.

## Generated asset provenance

Mode: image generation followed by transparent-background extraction edit.
Output: dist/city-functions-v38.webp (1536 x 1024).
Source: generated_images/exec-b0299a00-3a65-4431-a020-fa173deb130f.png.
Brief: transparent isometric medieval city sprite atlas, four columns/four rows,
coherent realistic muted palette and shared lighting; row one four agricultural
fields without houses, row two open timber sawmill, distinct brick factory with
chimneys and two research laboratories with glass structures, row three four
progressively developed gardens, row four four ranches with barns and paddocks.
Alpha checked from PNG pixels; WebP preserves alpha. Renderer crops each tile to
its visible content. No generated text or UI is used.
