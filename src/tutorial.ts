// Evoloom — interactive step-by-step tutorial.
//
// A coach overlay that explains the artificial chemistry while driving the
// live simulation through scripted demos: pausing, selecting, painting,
// pasting a hand-built protocell, lysin, game mode. Navigation via
// Next/Back buttons, ←/→ keys, progress dots; Esc or Skip leaves anytime.

import type { ControlMsg, SelectionState } from './snapshot';
import { RADIUS } from './cell';

export interface TutorialDeps {
  send(msg: ControlMsg): void;
  logStatus(msg: string): void;
  isPanelOpen(): boolean;
  openPanel(): void;
  closePanel(): void;
  /** Toggle-style brush activation — safe to call with the desired mode. */
  setBrush(brush: 'pan' | 'soup' | 'water' | 'select'): void;
  setPaused(paused: boolean): void;
  isPaused(): boolean;
  openInspector(): void;
  closeInspector(): void;
  isInspectorOpen(): boolean;
  viewCenterWorld(): { x: number; y: number };
  setSpeed(n: number): void;
  getSpeed(): number;
  setLysin(on: boolean): void;
  isGameMode(): boolean;
  toggleGame(): void;
}

interface Step {
  title: string;
  html: string;
  /** CSS selector of an element to ring with the spotlight. */
  spotlight?: string;
  enter?(d: TutorialDeps): void;
  exit?(d: TutorialDeps): void;
}

// ── Demo protocell ──────────────────────────────────────────────────────────
// Same geometry as init.ts buildCell: a closed 'a' membrane (states S=39,
// T=40 anchors) enclosing the gene strand e-b-b-a-c-b-d-f (state 1).
// pasteSelection re-centers the coordinates, so we build around the origin.
const S = 39;
const T = 40;

function buildDemoCell(): SelectionState {
  const D = RADIUS * 2;
  const cellX: number[] = [];
  const cellY: number[] = [];
  const cellType: string[] = [];
  const cellState: number[] = [];
  const bonds: number[] = [];

  const add = (x: number, y: number, type: string, state: number): number => {
    cellX.push(x); cellY.push(y); cellType.push(type); cellState.push(state);
    return cellX.length - 1;
  };
  const bond = (a: number, b: number): void => { bonds.push(a, b); };

  // Gene strand — indices 0..7
  const geneTypes = ['e', 'b', 'b', 'a', 'c', 'b', 'd', 'f'];
  const gene = geneTypes.map((t, i) => add((i + 1) * D, 0, t, 1));
  for (let i = 0; i < gene.length - 1; i++) bond(gene[i], gene[i + 1]);

  // Membrane loop around the strand (mirrors buildCell: memLen=2, memWid=8)
  const sy = -D;
  let prev = add(0, sy, 'a', T);
  const memStart = prev;
  bond(memStart, gene[0]);
  for (let i = 0; i < 2; i++) { const c = add(0, sy + (i + 1) * D, 'a', S); bond(c, prev); prev = c; }
  for (let i = 0; i < 8; i++) {
    const c = add((i + 1) * D, sy + 2 * D, 'a', i === 7 ? T : S);
    if (i === 7) bond(c, gene[gene.length - 1]);
    bond(c, prev); prev = c;
  }
  for (let i = 1; i >= 0; i--) { const c = add(9 * D, sy + (i + 1) * D, 'a', S); bond(c, prev); prev = c; }
  for (let i = 8; i >= 0; i--) { const c = add((i + 1) * D, sy, 'a', S); bond(c, prev); prev = c; }
  bond(prev, memStart);

  return {
    magic: 'primordium-selection', version: 1,
    savedAt: new Date().toISOString(),
    atomCount: cellX.length, cellX, cellY, cellType, cellState, bonds,
  };
}

// ── Steps ───────────────────────────────────────────────────────────────────
const STEPS: Step[] = [
  {
    title: 'Welcome to Evoloom',
    html: `Evoloom is an <b>artificial chemistry</b>: thousands of atoms drift
      through a 2D soup, react with their neighbors and form bonds — and out
      of that, membrane-enclosed cells emerge that copy their genome and
      divide.<br><br>This tour walks you through it <b>live</b>, with real
      demos running in the simulation. <b>Next →</b> advances,
      <b>Esc</b> or <b>Skip tour</b> leaves anytime.`,
  },
  {
    title: 'The soup: atoms, states, bonds',
    html: `Every dot is an <b>atom</b> with a <b>type</b>
      (<code>a–f, w, p</code>) and a numeric <b>state</b>. Atoms jiggle in
      Brownian motion. When two collide, a reaction rule can flip their
      states or create/break a <b>bond</b> — that is all the physics there
      is.<br><br>Bonds build structures: chains, loops, cells.`,
  },
  {
    title: 'Camera & views',
    html: `<b>Drag</b> to pan, <b>scroll</b> to zoom. Press <kbd>V</kbd> to
      cycle render modes: <b>Educational</b> (legend + bonds + membranes),
      <b>Microscope</b> and <b>Classic</b> (the original Squirm3
      look).<br><br>Try it — press <kbd>V</kbd> once or twice now.`,
  },
  {
    title: 'The Controls panel',
    spotlight: '#control-panel',
    enter: (d) => d.openPanel(),
    html: `Everything lives in the <b>Controls</b> panel (<kbd>M</kbd> or
      the ☰ button): playback, brushes, world seeding, physics sliders,
      lab tools, archive/export.<br><br>The <b>Shortcuts</b> card at the
      bottom lists every keybind.`,
  },
  {
    title: 'Pause and look closely',
    enter: (d) => { d.closePanel(); d.setPaused(true); },
    html: `The sim is now <b>paused</b> (<kbd>Space</kbd> toggles). Zoom
      into any cluster — each circle shows its <b>type letter + state
      number</b>.<br><br>Watch the colors: each atom type has its own, and
      the number after it is the current state.`,
  },
  {
    title: 'Select & inspect atoms',
    enter: (d) => {
      d.setBrush('select');
      const c = d.viewCenterWorld();
      d.send({ type: 'selectAt', x: c.x, y: c.y, radius: 160 });
      d.openInspector();
    },
    exit: (d) => { if (d.isInspectorOpen()) d.closeInspector(); d.setBrush('pan'); },
    html: `I just selected the atoms at the view center and opened the
      <b>inspector</b> (<kbd>I</kbd>) — a frozen, atom-level view of the
      selection.<br><br>In <b>Edit</b> mode you can add atoms, bond them or
      delete them; <b>Replace</b> swaps a type in the whole sim. Close the
      inspector or press Next.`,
  },
  {
    title: 'A real protocell',
    enter: (d) => {
      d.setPaused(false);
      const c = d.viewCenterWorld();
      d.send({ type: 'pasteSelection', x: c.x, y: c.y, selection: buildDemoCell() });
      d.logStatus('Tutorial: pasted a hand-built protocell at view center');
    },
    html: `I just dropped a <b>minimal protocell</b> into the view: a
      closed ring of <code>a</code> atoms (the membrane) enclosing a gene
      strand <code>e-b-b-a-c-b-d-f</code>.<br><br>Nothing in the engine
      knows the word "cell" — this is just a pattern of bonded atoms. Find
      it at the center of your view.`,
  },
  {
    title: 'Genome copying & division',
    enter: (d) => d.setSpeed(24),
    html: `I sped the sim up. When a free <code>d</code> atom touches the
      strand start (<code>e</code>), it acts as a <b>polymerase</b>: it
      walks the template and builds a copy. Reaching <code>f</code> splits
      the cell into <b>two daughters</b>.<br><br>Give it a moment — real
      replication, driven only by local reaction rules.`,
  },
  {
    title: 'Paint atoms yourself',
    enter: (d) => {
      d.setBrush('soup');
      const c = d.viewCenterWorld();
      d.send({ type: 'paintSoup', x: c.x, y: c.y, radius: 120, count: 40 });
    },
    exit: (d) => d.setBrush('pan'),
    html: `The <b>soup brush</b> (<kbd>B</kbd>) is active — I painted a
      burst of free atoms. <b>Drag on the canvas</b> now to paint your own;
      membranes absorb free <code>a</code> atoms when stretched.<br><br>
      More atoms = more reactions = faster evolution.`,
  },
  {
    title: 'Water & hydrolysis',
    enter: (d) => {
      const c = d.viewCenterWorld();
      d.send({ type: 'paintWater', x: c.x, y: c.y, radius: 60 });
    },
    html: `I dropped a <b>water droplet</b> (<kbd>W</kbd> paints,
      <kbd>C</kbd> clears). Fresh water can cleave bonds — with
      <b>hydrolysis</b> (<kbd>H</kbd>) on, water actively decomposes
      structures. Live cells are protected while their membrane holds.`,
  },
  {
    title: 'Lysin — the predator molecule',
    enter: (d) => d.setLysin(true),
    exit: (d) => d.setLysin(false),
    html: `I seeded <b>lysin</b> (<code>p</code>) — a catalyst that eats
      membrane <code>a-a</code> bonds and is never consumed. Watch
      membranes dissolve on contact.<br><br>This is how cells die in the
      soup: breached membrane, spilled genome.`,
  },
  {
    title: 'Noise & evolution',
    spotlight: '#control-panel',
    enter: (d) => d.openPanel(),
    html: `In the panel's <b>Lab</b> section, <b>Noise</b> (<kbd>N</kbd>)
      injects copy misfires, decay and bond failures — mutation. Mutated
      gene strands produce different cells; cells compete for soup
      atoms.<br><br>That's real evolution: variation + selection.`,
  },
  {
    title: 'Play mode — steer a microbe',
    enter: (d) => { d.closePanel(); if (!d.isGameMode()) d.toggleGame(); },
    exit: (d) => { if (d.isGameMode()) d.toggleGame(); },
    html: `<b>Game mode</b> (<kbd>G</kbd>) is on: the green microbe is
      yours. Steer its Brownian drift with <b>WASD</b>.<br><br>You win when
      no enemy cell survives ~5 s with a closed membrane; you lose if all
      your cells are lysed. Try steering for a moment!`,
  },
  {
    title: 'Save, load, freeze',
    html: `<kbd>[</kbd> / <kbd>]</kbd> quicksave & quickload.
      <b>Save</b> exports the full state as JSON — reloading is
      bit-identical, PRNG cursor included.<br><br><kbd>F</kbd>
      <b>freezes</b>: pause + zero noise + quicksave — "I see something
      interesting, stop everything." Sample saves live in
      <code>samples/</code>.`,
  },
  {
    title: 'Build your own chemistry',
    spotlight: '#lab-open-btn',
    enter: (d) => d.openPanel(),
    html: `The <b>⚗️ Custom chemistry editor</b> lets you define your own
      atoms and reaction rules — they fire <i>after</i> the built-in
      chemistry, so the seeded world keeps working.<br><br>Its
      <b>📖 Dictionary</b> tab explains every atom in plain English.`,
  },
  {
    title: "You're set — go evolve things",
    enter: (d) => d.closePanel(),
    html: `That was the whole tour. Dig deeper:<br><br>
      📄 <b>How_to_play.md</b> — the full manual in the repo<br>
      🧪 <a href="https://github.com/rubo77/OrganicBuilder" target="_blank"
      rel="noopener">Organic Builder</a> — Hutton's own step-by-step
      tutorial app for this exact reaction model<br><br>
      Now: crank the noise, seed a cell, and watch what emerges.`,
  },
];

// ── Engine ──────────────────────────────────────────────────────────────────
let overlay: HTMLDivElement | null = null;
let spot: HTMLDivElement | null = null;
let card: HTMLDivElement | null = null;
let deps: TutorialDeps | null = null;
let index = 0;
let active = false;
let savedPaused = false;
let savedSpeed = 8;

export function startTutorial(d: TutorialDeps): void {
  if (active) return;
  deps = d;
  active = true;
  index = 0;
  savedPaused = d.isPaused();
  savedSpeed = d.getSpeed();
  buildDom();
  window.addEventListener('keydown', onKey, true);
  window.addEventListener('resize', positionSpotlight);
  renderStep();
}

function buildDom(): void {
  if (overlay) return;
  overlay = document.createElement('div');
  overlay.id = 'tutorial-overlay';
  spot = document.createElement('div');
  spot.id = 'tutorial-spot';
  spot.hidden = true;
  card = document.createElement('div');
  card.id = 'tutorial-card';
  overlay.appendChild(spot);
  overlay.appendChild(card);
  document.body.appendChild(overlay);
}

function renderStep(): void {
  const step = STEPS[index];
  const d = deps!;
  if (step.enter) step.enter(d);
  const dots = STEPS.map((_, i) =>
    `<span class="tutorial-dot${i === index ? ' current' : ''}"></span>`).join('');
  card!.innerHTML = `
    <div class="tutorial-step-label">Step ${index + 1} / ${STEPS.length}</div>
    <div class="tutorial-title">${step.title}</div>
    <div class="tutorial-body">${step.html}</div>
    <div class="tutorial-nav">
      <button id="tut-prev" ${index === 0 ? 'disabled' : ''}>← Back</button>
      <span class="tutorial-dots">${dots}</span>
      <button id="tut-skip">Skip tour</button>
      <button id="tut-next">${index === STEPS.length - 1 ? 'Done ✓' : 'Next →'}</button>
    </div>`;
  byId('tut-prev').addEventListener('click', () => goTo(index - 1));
  byId('tut-next').addEventListener('click', () => goTo(index + 1));
  byId('tut-skip').addEventListener('click', closeTutorial);
  positionSpotlight();
}

function byId(id: string): HTMLElement {
  return card!.querySelector('#' + id) as HTMLElement;
}

function positionSpotlight(): void {
  if (!spot) return;
  const sel = STEPS[index].spotlight;
  const el = sel ? (document.querySelector(sel) as HTMLElement | null) : null;
  const rect = el ? el.getBoundingClientRect() : null;
  if (!el || !rect || (rect.width === 0 && rect.height === 0)) {
    spot.hidden = true;
    return;
  }
  const pad = 6;
  spot.hidden = false;
  spot.style.left = `${rect.left - pad}px`;
  spot.style.top = `${rect.top - pad}px`;
  spot.style.width = `${rect.width + pad * 2}px`;
  spot.style.height = `${rect.height + pad * 2}px`;
}

function goTo(next: number): void {
  if (next < 0 || next >= STEPS.length) { closeTutorial(); return; }
  const leaving = STEPS[index];
  if (leaving.exit) leaving.exit(deps!);
  index = next;
  renderStep();
}

function onKey(e: KeyboardEvent): void {
  if (!active) return;
  if (e.code === 'Escape') {
    e.stopPropagation();
    closeTutorial();
  } else if (e.code === 'ArrowRight') {
    e.stopPropagation();
    goTo(index + 1);
  } else if (e.code === 'ArrowLeft') {
    e.stopPropagation();
    goTo(index - 1);
  }
}

function closeTutorial(): void {
  if (!active) return;
  const leaving = STEPS[index];
  if (leaving.exit) leaving.exit(deps!);
  active = false;
  window.removeEventListener('keydown', onKey, true);
  window.removeEventListener('resize', positionSpotlight);
  overlay?.remove();
  overlay = spot = card = null;
  // Restore the world state the tutorial found.
  deps!.setSpeed(savedSpeed);
  deps!.setPaused(savedPaused);
  if (deps!.isInspectorOpen()) deps!.closeInspector();
  deps!.setBrush('pan');
  deps!.logStatus('Tutorial finished — the soup is yours.');
}
