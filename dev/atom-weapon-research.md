# Atom-Complex Weapon — Research & Design

Goal: a player-launched projectile — a small bonded atom complex with
its own propulsion — that carries lysin to enemy membranes and dissolves
them, giving game mode an *active* win mechanic instead of the current
passive lysin-wait.

## Research summary

### What exists upstream (David Castro / DavidOrtsac)

- **Repo description & README** — game mode is documented as exactly:
  "WASD biases your cell's Brownian motion, with periodic soup/water/
  lysin spawns and win/lose detection". No weapon, no attack rule,
  no projectile concept anywhere.
- **dabbycastro.com** — the Primordium project entry focuses on the
  engine port (Web Worker physics, WebGPU, seeded determinism, save/
  replay, Tim Hutton confirming emergent bounding membranes). Nothing
  about gameplay mechanics beyond what the README says.
- **x.com/davidortsac** — not machine-readable; no public posts found
  describing a designed win mechanic. The repo owner additionally
  tried reaching David Castro directly via X from
  [https://x.com/reubwo](https://x.com/reubwo) (account @reubwo) —
  no reply received at the time of writing.
- **Conclusion:** no evidence of an intended-but-unfinished attack
  mechanic upstream. The open question in
  `dev/open-gameplay-questions.md` stands — we're designing new.

### Related projects

- **timhutton/squirm3** (original, GPL v3) — pure artificial chemistry;
  lysin `p` atoms already exist as ambient hazards that dissolve S–S
  membrane bonds. No combat steering.
- **Tim Hutton's Squirm worlds** (squirm2/3/4) + paper *Evolvable
  Self-Reproducing Cells in a 2D Artificial Chemistry* (ALife 13(1),
  2007) — chemistry-only, no directed propulsion.
- **primordial (ese-llc.com)** — unrelated micro-organism evolution
  game; lunge/bite combat. Inspiration at most.
- **pplmx/primordium** — unrelated terminal alife sim sharing the name.

## What the code gives us

| Piece | Where | Relevance |
|---|---|---|
| Lysin rule `a,S–a,S + p,0 → breaks S–S (cases=10)` | init.ts:104 | `p` is already the weapon payload — dissolves ANY S membrane, player included |
| Predator attack `a,S–a,S + a,Q → FREED (cases=3)` | init.ts:118 | proves contact-based killing works; Q is sandbox-only, not spawned in matches |
| `bondedDamping = 1.0` | grid.ts:39 | bonded clusters keep velocity — a thrust kick accumulates until `MAX_VELOCITY` (2.4/step) |
| Player steering = biased random kick on `playerControlled` atoms | grid.ts:498 | the exact propulsion pattern to reuse for the projectile |
| Free atoms re-randomize velocity each step | grid.ts:471 | projectile MUST be a bonded cluster or it can't hold a course |
| `REACTION_RANGE = 2.5·RADIUS` (15 units) | grid.ts:8 | spawn clearance needed so the shot doesn't dissolve the player's own ring |
| `spawnLysinSpot()` / respawn timers | physics-worker.ts:231 | spawn-pattern precedent for game-mode-only entities |

## Design: the "lysin dart"

**Payload choice.** A bonded cluster of `p` atoms is already the
perfect ammunition — inert to every rule except the lysin reaction,
nothing in the chemistry can break `p–p` bonds (the lysin rule breaks
the *target's* S–S bond, not p's). Adding a shaft of `a,0` atoms would
just feed enemy membranes (stretch rule absorbs free `a`) — cosmetic,
skip for v1. Pure-`p` cluster of ~5 atoms.

**Self-damage problem.** `p` dissolves the player's own membrane on
the way out. Two options:

- *Sheathed state:* spawn `p` in state 45 (no rule references 45, so
  it's inert to every wildcard too), arm to state 0 after a delay.
  Extra machinery.
- *Spawn clearance (chosen):* place the cluster just *outside* the
  player's membrane ring — `loopRadius + 4·RADIUS` > `REACTION_RANGE` —
  flying outward. Armed immediately; steering back into your own shot
  is a real, fair risk. Zero new states, zero chemistry changes.

**Propulsion.** New per-atom thrust fields (`thrustX/Y`,
`thrustUntilIter`) applied in the same motion pass as the player bias —
constant direction, stronger kick than PLAYER_KICK (it's a dart, not a
nudge), capped by `MAX_VELOCITY` like everything else. Fuel ~600 ticks,
then it drifts as loose armed lysin — a lingering hazard for everyone.

**Firing.** `fire {dx,dy}` message → worker finds the player loop
centroid, spawns the cluster at rim + clearance along `dir`, sets thrust
fields. Cooldown (~600 ticks ≈ 1.25 s) exported in the snapshot so the
HUD can show reload state.

**UI.** Circular fire pad top-left inside `#scope-frame` (DOM, so it
works on touch): press position from center = fire direction, needle
visual + conic-gradient cooldown sweep. Sits under the game HUD that
already replaced the sandbox legend in that corner.

## Implementation outcome (verified)

**Architecture:** `src/dart.ts` owns spawn + lifecycle, shared by the
worker and the dev probe — `spawnDart()` builds the bonded p-cluster,
`updateDarts()` runs detonation/expiry. The worker (`fireDart`) only
computes aim (player centroid + outer ring radius), enforces the
720-iter cooldown, and tracks clusters; `runOneStep` calls
`updateDarts` per tick.

**Detonation fix from testing:** the first micro-sim showed a grazing
dart only shaved the ring (~87% bonds, resealing) — contact time was
too short. `updateDarts` now detonates on first contact with a bonded
non-player 'a' atom: the cluster's p–p bonds break and the payload
scatters as a lysin cloud that keeps grinding the breach. With
detonation, `dev/dart-sim.ts` reports: detonation at iter 58, enemy
loop gone from iter ~100 and never resealed, player loop intact for
the full 800 iters.

**UI:** `#fire-pad` (88 px, top-left under the stats box) replaces the
sandbox legend in game mode. Press offset from center = launch
direction; gold needle marks aim, conic sweep drains the cooldown.
HUD shows `dart: READY|x.xs · N out`. Cooldown mirror is updated in
`loop()` unconditionally (drawHud only runs in educational+visible).

**Bug found along the way:** `#scope-frame` was `overflow:hidden` —
a scroll container. Clicking a closed-panel button let Chromium
auto-scroll `scrollLeft` to 380, dragging canvas + pad off-screen.
Fixed with `overflow: clip` (clips identically, never scrolls).

**Verified:** `dev/dart-sim.ts` PASS · Playwright `fire-pad.spec.js`
(pad visibility, dir mapping dir(1.00,0.00)→needle 90°, worker fire
log, cooldown blocks immediate re-press, reload re-arms, pad hides on
exit) · tutorial.spec.js still green · tsc + build + 14/14 smoke tests.

## Iteration 2 — tracers, homing, kill feed

- **Tracer rendering:** snapshot flag bit5 marks atoms still under
  thrust; the 2D renderer draws them as bright gold discs with a white
  rim, the GPU renderer as bright 1.4× discs. Shots are now clearly
  visible in flight instead of blending into ambient lysin soup.
- **Terminal guidance:** inside 150 units a cluster blends its shared
  thrust vector 8%/tick toward the nearest bonded non-player 'a' atom.
  Short range + gentle turn = aim assist, not lock-on. Verified in
  `dart-sim.ts` with the enemy placed 40 units off the firing line:
  the dart curved from y=250 to y≈264 and detonated at iter 52.
- **Kill feed:** `☠ Enemy down — N left` in the status line whenever
  the enemy loop count drops mid-match. Reports only new minimums —
  enemies replicate mid-match, so a bounce down after a division
  (5→6→5) is not a kill; a drop below the running minimum is.

## Iteration 3 — ammo economy, enemy threat, authoritative rejects

### Ammunition economy

- Darts cost **5 lysin atoms** (`DART_ATOMS`), drawn from a worker-side
  magazine. The match starts with **15 atoms = 3 darts**
  (`DART_AMMO_START`, shared via `snapshot.ts`), magazine capped at 50
  (`DART_AMMO_MAX` = 10 darts).
- **Pickup:** flying through ambient orange `p` atoms within
  `RADIUS × 2.2` of a player-controlled atom banks them (removed from
  the soup). Lysin spots become a strategic resource instead of pure
  scenery.
- The HUD dart line shows the magazine (`dart: READY · ammo 15`, or
  `dart: no lysin (N)` in red below 5); the pad gains an `empty` class
  (dimmed) when it can't fire.

### Enemy threat

- Enemies seek the player: enemy membrane atoms within 700 units get
  a weak per-tick velocity pull toward the player centroid
  (`ENEMY_SEEK_KICK 0.004`, evaluated every 10 iterations) — well below
  the steering bias, so the player can always outrun a pursuer.
- Contact damages the player: player membrane atoms with a bonded
  enemy `a` within `RADIUS × 2.5` roll a bite each check
  (`BITE_CASES 120`) — a hit debonds one S–S pair and frees the atom
  back to soup, the same breach lysin causes. Rare per tick, lethal
  on a sustained hug — the match now has real stakes, not just a
  shooting gallery.

### Authoritative rejection channel

- The fire gate lives in the worker. A mirrored client-side check can
  lag a snapshot — the first Playwright failures were presses swallowed
  by a stale `lysinAmmo = 0` from pre-match sandbox snapshots.
- Fix: the worker answers real rejects with a `fireRejected` message
  (`reason: 'ammo' | 'cooldown'`); the status line explains
  `Out of lysin — fly through orange p-atoms to rearm` or
  `Reloading…`. The main thread keeps the cooldown mirror only as a
  fast-path for the pad sweep — never as the gate.

### Test fixes discovered here

- `fire-pad.spec.js` waits on the pad's `--cd` CSS var (mirrors the
  live cooldown fraction). The snapshot lags the worker's `[WEAPON]`
  console line, so after each confirmed shot the test first waits for
  the reload to *engage* (non-zero) and only then for `0.000` —
  otherwise it reads the stale zero and presses into the real
  cooldown.
- Kill feed assert moved off the status text (transient, overwritten
  by other feeds) onto the deterministic worker log line.

## Test plan

- Playwright: enter game mode → dispatch fire → assert projectile atoms
  exist, move outward in the fired direction, and reach an enemy ring;
  debug `console.log('[FIRE] …')` + `[WEAPON]` worker logs behind a
  debug flag for trajectory tracing.
- Small-sim unit probe via worker messages (spawn 2 cells close
  together, fire at point-blank, watch enemy loop count drop).
