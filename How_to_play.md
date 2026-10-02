# Primordium — Manual

An artificial chemistry simulator: atoms drift through a 2D soup, react
with their neighbors, form bonds, and — given the right chemistry —
self-assemble into membrane-enclosed protocells whose gene strands
replicate by template copying. Based on Tim Hutton's Squirm3 (2007).

This manual mirrors the in-app docs (controls panel, shortcuts card,
atom dictionary).

## Getting started

1. Serve the project over HTTP (workers need an origin): `bash run.sh`
   or `python3 -m http.server 9131`, then open `http://localhost:9131/`.
2. The sim starts with a seeded soup. Watch protocells emerge on their
   own — or open the **Controls** panel (`M` / ☰ button) to intervene.

## Views

`V` cycles three render modes:

- **Educational** — legend + bonds + bezier membranes (default)
- **Microscope** — microscope-styled render pass
- **Classic** — Squirm3-style classic look

## Controls panel

### View · Playback
- **Pause** (`Space`) — pause/resume the sim
- **View** (`V`) — cycle render mode
- **● REC** (`R`) — record the canvas as a video

### Brushes · Tools
- **Soup brush** (`B`) — paint free soup atoms into the world
- **Water brush** (`W`) — paint water droplets
- **Clear water** (`C`) — remove all water
- **Select atom** — click an atom to select; `Del` deletes it
- **Lysin** (`P`) — seed/remove lysin; membranes dissolve on contact

### World · Replenishment
- **Drip** — periodic replenishment; sliders set intervals in ticks
  (soup 100–3000, default 700 · water 500–15000, default 4250)
- **Burn** — fast-forward the sim N iterations (default 100,000)
- **Seed** — reseed the PRNG and restart

### Physics
- **speed** — sim speed (1–30, default 8)
- **soup** — soup density (0–100%, default 60)
- **damp** — bonded-atom damping (0.50–1.00)

### Lab
- **Noise** (`N`) — mutagenic noise sliders: `copy` (copy misfires),
  `decay` (random decay), `bond` (bond failures), 0–1000 each
- **Hydrolysis** (`H`) — water-driven bond cleavage; `rate` multiplier
  and `density` threshold
- **Open inspector** (`I`) — frozen view of the current selection
- **Paste from JSON** — drop a saved selection at view center
- **Custom chemistry editor** — define your own atoms and rules

### Archive · Export
- **Save / Load** — full sim state as JSON (atoms, bonds, droplets,
  RNG state, parameters — reload is bit-identical, PRNG cursor included)
- **Reset simulation** — wipe and restart
- **stats CSV** — population/loop statistics log, exportable
- **events CSV** — event log (noise misfires, bond failures, …)

## Play mode — steer a microbe

`G` toggles the game mode: you control a green microbe.

- **WASD** biases your cell's Brownian motion — a nudge, not propulsion
- Periodic **soup/water spawns** keep you fed; **lysin micro-spots**
  appear every ~10,000 ticks and dissolve membranes on contact
- A membrane loop counts as **yours** when ≥ 40 % of its atoms are
  player-controlled
- **Win** 🏆 — no *fully alive* enemy cells (closed membrane with both
  gene endpoints bonded) survive for ~5 seconds
- **Lose** ☠ — all your cells are lysed

## Atom dictionary

Built-in atoms (`a`–`f`, `w`, `p`) — wildcards `x`/`y`/`z` are reserved
for rule matching:

| Atom | Role |
|------|------|
| `a` | **Membrane unit** — structural building block of cell walls. A closed loop of `a` atoms *is* the membrane. Lysin (`p`) and water break `a`-`a` bonds. In state 38 it doubles as a gene base. Analogue: peptidoglycan. |
| `b` | **Common gene base** — most frequent base in the genome strand (template `e-b-b-a-c-b-d-f`). The polymerase walks past it. Analogue: adenine/thymine. |
| `c` | **Rare gene base** — appears once in the default template; functionally identical to `b` but rarer. Analogue: cytosine/guanine. |
| `d` | **Polymerase enzyme** — walks a gene strand (state 41) copying it base-by-base; releases at `f`. `d` is both the enzyme and a residue of the gene encoding it — like real DNA polymerase. |
| `e` | **Gene start** — marks one strand end, anchored to a T-tagged membrane atom (chromosome tethered to the wall, like oriC). Replication starts here. |
| `f` | **Gene end** — marks the other end, anchored opposite. Polymerase reaching `f` releases the strand and triggers division into two daughter cells. Analogue: ter site + FtsZ divisome. |
| `w` | **Water** — droplets held by surface tension. Fresh water (state 0) can cleave one non-protected bond per tick, then becomes spent (state 1). Mass-conserving; live-cell membranes are immune. |
| `p` | **Lysin** — catalyst that cleaves `a`-`a` membrane bonds while free; never consumed. Only active when *unbonded* — force-bonded lysin is inert. Analogue: lysozyme / phage endolysin. |

## Selection inspector

Select an atom (`Select atom` brush), then open with `I`:

- Read-only frozen view with stats; sim keeps running underneath
- **Edit** mode — tools to `＋ Add`, `⎯ Bond`, `✕ Delete` atoms with a
  type palette and state input; edits apply to the live sim
- **Replace** — swap every atom of a source type in the entire sim
- **Download / Load JSON** — save selections, reload in future runs,
  paste via `📥 Paste` (drops at view center, bonds preserved)

## Custom chemistry editor (⚗️ Lab)

- **Custom atoms** — `a`–`f`, `w`, `p`, `x`–`z` are reserved; new atoms
  get an uppercase letter or digit. Without rules they are inert.
- **Custom rules** — fire *after* built-in chemistry; they can never
  override or remove seeded reactions. 2-input or 3-input reactants;
  `Cases` is the probability denominator (1 = always, 100 ≈ 1 % per
  encounter). Rules can flip states and create/break bonds.
- **Dictionary tab** — every atom explained in plain English; custom
  atoms get auto-generated descriptions from your rules.

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `M` | open / close the controls panel |
| `Space` | pause / resume |
| `V` | cycle view (Educational → Microscope → Classic) |
| `B` | soup brush |
| `W` | water brush |
| `C` | clear all water |
| `P` | lysin on / off |
| `R` | record video |
| `G` | play mode (steer a microbe) |
| `N` | noise on / off |
| `H` | hydrolysis on / off |
| `[` | quicksave |
| `]` | quickload |
| `F` | freeze (pause + zero noise + quicksave) |
| `Del` | delete selected atom (in Select mode) |
| `Esc` | close panel / back to pan |
| drag | pan camera |
| wheel | zoom under cursor |
| 2-finger | pinch to zoom (touch) |

## Persistence

- **Autosave** — periodic snapshots to `localStorage`; a closed tab
  returns to nearly the same state (skipped while paused)
- **Save files** — full sim state JSON; reload produces bit-identical
  evolution from the stored PRNG cursor
- **Samples** — `samples/` contains a documented meta-membrane
  formation sequence (see `samples/README.md`)
