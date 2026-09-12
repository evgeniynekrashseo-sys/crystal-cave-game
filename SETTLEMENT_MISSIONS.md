# Living settlement and chemistry missions

The mobile city is a separate full-screen strategy map. Canvas sprites, residents and roads render from simulation state; purchased buildings are not part of a flattened background image. Pan the map, zoom, tap a building to upgrade, choose Build to place a new building, and tap Chemistry or the central laboratory to return to the puzzle.

Workers walk to jobs, produce only when their required inputs exist, and deliver output to the central square. Unassigned villagers walk around the settlement. Construction opacity/countdowns, walking/work motion, tree movement and laboratory bubbles animate while the map is open. Reduced-motion preferences suppress decorative animation; the simulation still operates. The town pauses while closed or the page is hidden. Progress is stored on this device.

## Formula missions

At level 5 and above, eligible levels add a city order after ordinary sorting. Recipes are offered only when their elements have already been discovered. At level 20 there can be two recipe stages, and at level 40 up to three, limited by available recipes. Seven tubes are reused; difficulty also adds impurity groups and reduces spare moves.

Tube 01 is the formula reactor. Select a donor, then tube 01 to transfer one atom. The reactor accepts different elements in the correct quantities; atom order is irrelevant. Wrong or excess atoms are rejected. Other tubes retain normal sorting. Complete the formula and clear the remaining impurity groups within the stage's move budget. Undo restores the formula state and coin balance. Each synthesis awards 45 coins; city discoveries are delivered only on successful completion of the whole level and never stack twice.

| Start level | Formula | Permanent city effect |
| --- | --- | --- |
| 5 | NaCl | +20% food output per delivery, with integer rounding |
| 10 | H₂O | +5 simulated health points |
| 15 | CO₂ | Additional +20% field output |
| 20 | NH₃ | Additional +30% field output |
| 25 | SiO₂ | +1 research for each subsequent newly completed level |

These are game effects, not quantitative scientific predictions. The formula puzzle represents composition, not instructions for making a chemical. In-game notes distinguish water composition from potable-water treatment and ammonia composition from industrial synthesis conditions.

Chemical grounding: [primary research on the Haber–Bosch reaction](https://arxiv.org/abs/1603.08041) describes nitrogen and hydrogen conversion to ammonia using catalysts under controlled conditions. Substance formulas use conventional atom counts. City technology percentages are explicitly simulation rules.

## Art and release status

The source is the approved bright ChemLab settlement concept. Individual starter structures and residents are masked from it at runtime. The reference's test tubes remain unchanged. Industrial building types currently reuse starter art and need distinct sprites in a later visual pass.

See design-qa.md: automated tests pass, but cloud-browser policy blocked visual/touch verification. The user authorized publishing this checkpoint without the blocked browser check on 2026-09-12. Publication does not mean visual/touch QA has passed.
