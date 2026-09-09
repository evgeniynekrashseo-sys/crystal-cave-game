# ChemLab — Game Logic Core

This file is the canonical gameplay specification preserved before a full repository reset.

## 1. Core loop

ChemLab is a deterministic tube-sorting puzzle framed as a fictional laboratory game.

A level starts with several tubes. Each tube contains up to 4 stacked symbolic element tokens. The player selects a source tube and then a destination tube. A move transfers the contiguous top run of identical symbols from the source into the destination when the move is legal.

The level is solved when every non-empty tube contains exactly 4 identical symbols.

The game must remain an abstract puzzle. It must not provide operational real-world chemical instructions, quantities, temperatures, procedures, or dangerous reaction guidance.

## 2. Tube rules

- Tube capacity: 4 symbols.
- A source tube must be non-empty.
- Source and destination must be different tubes.
- Destination must have free capacity.
- If destination is non-empty, its top symbol must match the source top symbol.
- A legal move transfers as many symbols as possible from the contiguous top run, limited by destination capacity.
- Empty tubes accept any symbol.

Pseudo-rule:

```text
transferCount = min(topRun(source), capacity - destination.length)
legal only when:
  source != destination
  source not empty
  destination not full
  destination empty OR top(destination) == top(source)
```

## 3. Win / lose

Win condition:

```text
for every tube:
  tube is empty
  OR
  tube has exactly 4 items AND all 4 are identical
```

Lose condition:

- The move counter reaches 0 before the puzzle is solved.

On loss, the player must always have access to:

- exact retry of the same puzzle;
- a new certified puzzle of the same level.

## 4. Guaranteed solvability

Every generated production puzzle must come from a certified puzzle bank or a generator that returns a verified solution path.

Required invariant:

```text
puzzle = createCertifiedPuzzle(symbolSet, level, seed, recentPuzzleKeys)
state = puzzle.tubes
solution = puzzle.solution
```

The game must never ship a puzzle without a known valid solution path.

Exact retry must reproduce the same puzzle by preserving the level and seed.

## 5. Difficulty progression

Base symbol count by level:

```text
levels 1–3   -> 3 active symbols
levels 4–7   -> 4 active symbols
levels 8–14  -> 5 active symbols
level 15+    -> 6 active symbols
```

More discovered symbols may exist in the account state, but the active level selects only the amount required by the current difficulty tier.

## 6. Symbol discovery

Canonical discovery pool:

```text
Na, Cl, Fe, O, C, H, Au, Li, He, Be, B, N, F, Ne, Mg, Al, Si, P, S
```

The discovery list expands gradually with level progression.

The system may visually represent these as fictional game tokens. Do not convert the puzzle into real-world chemistry instructions.

## 7. Puzzle anti-repeat

Maintain a short list of recently used puzzle keys.

For a new puzzle:

- avoid the last 3 puzzle keys when possible;
- once selected, move the new key to the end of the recent list;
- cap the list at 3 entries.

Exact retry ignores anti-repeat filtering and restores the same combination.

## 8. Move budget

The initial move budget is derived from the certified solution length with extra tolerance:

```text
base = solution.length
level < 5   -> base + 6
level < 10  -> base + 4
level >= 10 -> base + 3
minimum displayed budget should not fall below 9
```

This preserves challenge while keeping every certified level realistically completable.

## 9. Undo

Before every successful move, push a snapshot:

```text
history.push({
  tubes: deepClone(currentTubes),
  moves: currentMoves
})
```

Undo restores the latest snapshot.

Using undo counts as an assist for mastery purposes.

## 10. Hint

Hint scans source/destination pairs and returns the first currently legal move.

A hint must not reveal any real chemistry information. It only references tube indices, for example:

```text
Tube 2 -> Tube 5
```

Using a hint counts as an assist.

## 11. Extra tube

The player may add one empty reserve tube per attempt.

Rules:

- maximum once per attempt;
- adds an empty tube;
- counts as an assist;
- must not mutate the certified solution data itself;
- must not change the core save schema.

## 12. Restart / shuffle

Restart/new puzzle starts the same level with a new seed.

Exact retry starts the current level with the existing seed and bypasses anti-repeat filtering.

## 13. Persistent state

The canonical core save key is:

```text
chemlab_v50
```

Do not rename or migrate this key without an explicit migration plan.

Core persisted shape:

```ts
type Persisted = {
  level: number
  gold: number
  nug: number
  xp: number
  score: number
  discovered: SymbolKey[]
  streak?: number
  bestStreak?: number
  recentPuzzles?: string[]
}
```

Default state:

```text
level = 1
gold = 0
nug = 0
xp = 0
score = 0
discovered = [Na, Cl, Fe]
streak = 0
bestStreak = 0
recentPuzzles = []
```

All future visual rebuilds must preserve this state contract unless a backward-compatible migration is intentionally implemented.

## 14. Rewards

On level completion:

```text
goldReward = 50 + level * 5 + min(30, remainingMoves * 2)
xpReward   = 25 + level * 2
```

Clean completion means no assists were used during the attempt.

Clean completion grants:

```text
+1 mastery crystal (nug)
```

Win streak increases by 1.

On loss, streak resets to 0.

Best streak stores the maximum reached value.

## 15. Mastery / cosmetics readiness

Mastery currency source of truth is `nug` from the core save.

Existing cosmetic thresholds used by the previous build:

```text
3 mastery  -> Neon Glass
6 mastery  -> Violet Glass
10 mastery -> Gold Glass
```

Cosmetic ownership/equip state must remain separate from `chemlab_v50` unless a future redesign explicitly changes the economy architecture.

Cosmetics must never affect puzzle solvability.

## 16. Level flow

On start:

1. Normalize level to at least 1.
2. Reset selection/history/assist counters.
3. Generate a certified puzzle.
4. Store the certified solution path.
5. Compute the move budget.
6. Hide previous win/lose overlays.
7. Save progression state.
8. Render the new attempt.

On successful move:

1. Validate legality.
2. Save undo snapshot.
3. Determine transfer count.
4. Animate presentation if a renderer exists.
5. Transfer symbols in logical state.
6. Decrease moves by 1.
7. Re-render.
8. If solved -> win.
9. Else if moves <= 0 -> lose.

## 17. Input lock

During move animation, gameplay input should be locked.

Required invariant:

```text
inputLocked = true before animation/transfer
inputLocked = false after state and render are synchronized
```

This prevents double-taps from corrupting puzzle state.

## 18. Selection behavior

- First tap on a non-empty tube selects it.
- Tapping the selected tube again deselects it.
- Tapping an incompatible non-empty tube may change selection to that tube.
- Tapping a legal destination performs the move.
- Tapping an illegal empty destination produces a non-destructive feedback message.

## 19. Rendering independence

Gameplay logic must remain independent from the art implementation.

The renderer may be replaced completely — Pixi, Canvas, WebGL, sprites, shaders, SVG, or another visual system — without changing:

- legal move rules;
- certified puzzle generation;
- level progression;
- save schema;
- move budget;
- rewards;
- assist accounting;
- win/loss logic.

This separation is mandatory for the next redesign.

## 20. Safety invariant

ChemLab is fiction-first gameplay.

Allowed:

- fictional element tokens;
- abstract "reactions";
- fantasy VFX;
- fictional synthesis language;
- non-operational educational flavor text.

Do not add:

- real reagent quantities;
- concentrations;
- reaction temperatures;
- pressure instructions;
- procedural mixing steps;
- instructions enabling dangerous reactions;
- real explosive/toxic synthesis procedures.

## 21. Production invariants for the rebuild

Every future implementation must satisfy all of the following before release:

- core save remains readable from `chemlab_v50`;
- existing player progress is not lost;
- every playable puzzle has a certified solution path;
- exact retry restores the same puzzle;
- no cosmetic or visual feature changes solvability;
- no renderer event can execute two moves for one player action;
- all assists are tracked consistently;
- no dangerous real-world chemistry instructions are present;
- mobile interaction remains fully playable;
- logic can run independently from the final art assets.

## 22. Product direction retained for the rebuild

The next version should preserve the core sorting loop but rebuild presentation from zero.

Visual target:

- premium mobile-game scene rather than a web dashboard;
- asset-driven laboratory environment;
- strong depth, lighting and atmosphere;
- high-quality glass/liquid rendering;
- tactile lifting, tilting and pouring;
- fictional reaction VFX;
- minimal HUD competing with the puzzle;
- gameplay visible immediately on first frame.

This section describes presentation goals only. The logic rules above remain authoritative.

## 23. Discovery-world extension (user-authorized, 2026-09-09)

The new user request extends the discovery pool to all 118 element symbols, preserves existing discoveries, and replaces automatic discovery with explicit research quests. The canonical core save key and fields remain unchanged; the symbol whitelist is expanded backward-compatibly. Expansion state is stored separately in `chemlab_world_v1`.

The sample reactor combines unlocked symbols independently of the sorting board. It provides fictional explosions, gold deposits, crystals and artifact rewards. A freezing recipe locks only the sample reactor until the next successful sorting move; the puzzle cannot be deadlocked by this effect. Each recipe grants once per campaign level, with a shared charge allowance (3 + reactor upgrade). Retry/shuffle/undo do not replenish claims. Mastery `nug` remains a clean-win reward; reaction crystals are a separate currency.

Research quests require a campaign level and cumulative reaction total. The active symbol count is capped by discovered count; selection rotates and includes the newest discovery. Every resulting puzzle still requires a certified solution. Daily quests use UTC calendar dates and idempotent claim flags. Three laboratory upgrades and earned-currency cosmetics do not affect solvability. See `MONETIZATION_ROADMAP.md` for the store-release boundary and monetization implementation that remains outstanding.
