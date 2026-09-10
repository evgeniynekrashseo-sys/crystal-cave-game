# ChemLab glass and progression QA — 2026-09-10

final result: passed

Scope: test-tube appearance matching the supplied reference, preserving interactive liquids and fixing post-win continuation. The surrounding screen was not redesigned.

Reference: `/workspace/scratch/ee83bc649bd6/upload/D040DFBB-BCF7-43AA-9F20-C4E4946764F8(6).jpeg`.
Browser render: `/workspace/scratch/ee83bc649bd6/qa-glass.jpg` (1363 × 936).
Combined reference/component comparison: `/workspace/scratch/ee83bc649bd6/qa-comparison.jpg`.
Mobile browser capture: `/workspace/scratch/ee83bc649bd6/qa-mobile.jpg` (390 × 844 iframe viewport).

Visual inspection: open oval rim, transparent glass, rounded bottom, aligned liquid boundaries and readable dark labels. Removed opaque sprite background. Seven tubes fit in two rows on mobile; the page scrolls to lower tools. No clipped labels or overlapping tubes. The generated glass is an approximation of the supplied reference, with subtler glow and a different highlight profile. Puzzle contents vary by level and seed; component comparison intentionally preserves actual gameplay contents.

Interaction evidence: completed level 1 through normal tube clicks; three synthesized sets cleared and coins increased; oxygen unlock appeared; visited discovery UI; pressed Next experiment and observed Experiment 02 with filled tubes and reset progress. No application errors in browser console; unrelated browser extension metadata errors were present.

Automated validation: 22/22 existing tests passed, including empty-rack progression, refill waves, reward rules and liquid-surface stability.

P3 follow-up: glow can be further art-directed; mobile tools remain below the initial viewport on longer racks.
