# ChemLab design QA

- Date: 2026-09-09
- Source target: user-supplied `D040DFBB-BCF7-43AA-9F20-C4E4946764F8(4).jpeg`
- Implementation: supervised local Sites preview, level 42 QA fixture
- Browser viewport: 1298 × 1000 px
- Responsive game canvas: 530 px wide
- Dense board: 400 px wide, 9 tubes in a 5 + 4 layout

## Visual comparison

The comparison was run with the source image and the current implementation rendered together.

- Separate liquid portions: matched. Each occupied element owns a rounded, softly separated liquid body; empty tube space has no grid lines.
- Element labels: matched. Symbols use a large dark weight, stay centered inside their liquid portion, and report zero measured horizontal overflow.
- Glass: matched to the target direction with a bright rim, thick side highlights, rounded base and soft neon edge.
- Liquid character: matched as a live equivalent rather than a flat copy. Each portion keeps its own color volume while the exposed top surface waves and bubbles.
- High-level density: adapted to the existing mobile game shell. The reference has one row of six; ChemLab uses 5 + 4 at level 42 so nine tubes remain legible.

## Iterations

1. First render exposed two issues: late-level tubes were too small and the stabilizer description clipped horizontally.
2. Final render enlarged dense tubes, wrapped modifier chips, removed the redundant large frost glyph, reduced hard segment outlines, and softened gaps between portions.

## Interaction and state checks

- A frozen tube rejected input and explained the remaining lock duration.
- A legal pour animated, reduced moves by one, and changed the frost counter from 2 to 1.
- The next valid move opened the cryo lock.
- Hint respected active modifiers.
- Undo restored both the move count and frost counter.
- Every tested label fit inside its token: maximum overflow 0 px.
- Application-origin console warnings/errors: 0. Browser-extension telemetry errors were excluded as unrelated to the page.

## Result

Passed. The component-level source target is reproduced faithfully within the existing ChemLab visual language, and the new late-game mechanics remain readable at the densest tested layout.
