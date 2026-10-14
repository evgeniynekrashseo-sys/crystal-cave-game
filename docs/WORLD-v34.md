# World edition v34

Implemented: 32×32 exploration (previously 20×20), regional atlas navigation,
elevated highlands with inverse terrain picking, continuous street surfaces,
four architectural stages for homes/workshops/schools/barns, unified vegetation,
residents and wildlife, compact warm city HUD. Legacy plots and saves retain
their positions and progression. Chemistry artwork is unchanged.

Validation: 91 Node tests; browser checks at 375, 430 and 768 pixels with a
populated upgraded city and highland navigation; no browser JavaScript errors.
The existing deterministic puzzle simulation completed 10,000 sessions.

Art generated with the built-in image generation tool. Runtime files:
`dist/world-buildings-v34.webp`, `dist/world-nature-v34.webp`,
`dist/world-people-v34.webp`. WebP compression preserves alpha and dimensions.

Prompt specifications: realistic restrained European medieval isometric camera,
upper-left daylight, aged oak/limestone/gray slate, consistent proportions.
Buildings: four by four atlas; rows homes, workshops, civic schools, barns;
columns timber/thatch, plaster/thatch, stone/slate, prosperous stone/slate.
Nature: spruce/oak/birch/hazel, granite/bank/cliff/stump, grasses/flowers/reeds/
berries, deer/cow/sheep/horse. Residents: worker, woman with basket, scholar,
farmer in four poses. Transparent backgrounds, no labels or baked ground tiles.

Scope limits: this remains an isometric sprite renderer, not a full 3D engine.
Special infrastructure still uses the prior atlas. Generated walking frames
have limited pose variation. This update is not a signed mobile store release.
