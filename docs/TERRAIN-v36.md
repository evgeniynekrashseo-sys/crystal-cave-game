# Terrain material pass v36

Project asset: `dist/terrain-meadow-v36.webp` (544,200 bytes). Generated using the built-in imagegen tool, then encoded as WebP at quality 88. This is a terrain material used by the renderer, not a painted backdrop containing buildings.

Prompt: “Use case: photorealistic-natural. Production game terrain texture, square 2048x2048, seamless tileable albedo, perfectly overhead orthographic view of a 12-meter-wide natural temperate village meadow ground surface. Realistic fine short olive green grass interwoven with irregular dry beige earth and muted brown soil, small clover, very sparse tiny pebbles, subtle dry straw. Earth accounts for 35 percent in irregular dispersed soft patches, grass 65 percent. Muted natural tones, detailed fine organic material suitable for a realistic medieval city builder. Flat diffuse daylight, NO directional shadows, no horizon, no trees, no buildings, no roads, no isolated large plants, no text, no grid, no vignette, no border. Uniform scale throughout, no large central feature. This is a repeatable ground material, not landscape concept art.”

The actual generated image is 1254 square. It is used at native resolution, mirrored at material preparation time to eliminate discontinuous repeat edges. Texture projection compresses the vertical scale to match the isometric ground plane. Soil retains its source colors instead of receiving the previous monochrome olive remap. Forest-floor patches use the same deterministic placement predicate as trees and exclude occupied cells.

Material contrast is reduced in the renderer while retaining hue differences. Forest groves include juvenile conifers and low shrubs with deterministic positions; occupied plots remove both trees and undergrowth.

Existing building positions, saves, game mechanics and approved chemistry visuals are unaffected. This is another terrain pass; new coasts, full architectural art replacement and native store release remain unfinished.
