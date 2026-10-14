# v41 — layout corrections, not final art overhaul

Fixed rear truck sprite orientation: its source faces up-left, so the back-view
flip is opposite to the front-view flip. Four world directions are regression tested.

Added shared world-space entrance anchors by building type. Paths to adjacent roads
follow the plot perimeter instead of crossing its center. Indoor worker transitions
use the same entrance path helper and face their entrance/exit travel direction.
These anchors are initial estimates; individual level artwork still requires
visual door calibration. Existing building locations and game progress preserved.

Field artwork widened from 1.54 to 1.82 units, ranch from 1.48 to 1.60, homes reduced
from 1.46 to 1.34; field soil contact deepened. Flat fields no longer cast a large
building-shaped silhouette shadow. Other original artwork remains unchanged.

Outstanding: mixed asset perspective/lighting and baked ground edges, door positions
for each architecture tier, transport steering, full landscape quality. Tests are
functional evidence, not evidence of reference-level graphic quality.
