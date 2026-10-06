// Lysin dart — the game-mode projectile shared by the physics worker and
// the dev micro-simulation (dev/dart-sim.ts). A bonded cluster of 'p'
// atoms is already the perfect ammunition: inert to every rule except
// the lysin reaction, and nothing in the chemistry can break p–p bonds
// (the lysin rule dissolves the *target's* S–S bond, not p's own).

import { Grid } from './grid';
import { Cell, RADIUS, MAX_VELOCITY } from './cell';

export const FIRE_COOLDOWN_TICKS  = 720;   // ~1.5 s between shots at 480 it/s
export const DART_FUEL_TICKS      = 600;   // thrust burn, then the dart drifts
const DART_THRUST                 = 0.10;  // per-step kick — ~5× the steering kick
const DART_ATOMS                  = 5;     // lysin payload atoms per dart
const DART_SPAWN_CLEARANCE        = 4;     // × RADIUS beyond the player ring —
                                           // > REACTION_RANGE (2.5) so the shot
                                           // can never dissolve the firing cell

// Build and arm a dart launched from just outside a membrane ring at
// (cx,cy) with outer radius ringRadius, flying along (ux,uy). Returns
// the bonded cluster and the spawn position for logging.
export function spawnDart(
  grid: Grid, cx: number, cy: number, ringRadius: number,
  ux: number, uy: number, now: number,
): { cluster: Cell[]; x: number; y: number } {
  const sx = cx + ux * (ringRadius + RADIUS * DART_SPAWN_CLEARANCE);
  const sy = cy + uy * (ringRadius + RADIUS * DART_SPAWN_CLEARANCE);
  const px = Math.max(RADIUS * 2, Math.min(grid.width  - RADIUS * 2, sx));
  const py = Math.max(RADIUS * 2, Math.min(grid.height - RADIUS * 2, sy));
  // Compact cluster: a core atom with the payload bonded around it —
  // the dart holds together mid-flight and grinds the target membrane
  // from multiple contact points at once.
  const core = grid.createCell(px, py, 'p', 0);
  const cluster: Cell[] = [core];
  for (let k = 0; k < DART_ATOMS - 1; k++) {
    const ang = (k / (DART_ATOMS - 1)) * Math.PI * 2;
    const a = grid.createCell(
      px + Math.cos(ang) * RADIUS * 1.6,
      py + Math.sin(ang) * RADIUS * 1.6,
      'p', 0);
    a.bondTo(core);
    cluster.push(a);
  }
  for (const a of cluster) {
    a.thrustX = ux * DART_THRUST;
    a.thrustY = uy * DART_THRUST;
    a.thrustUntilIter = now + DART_FUEL_TICKS;
    // Initial velocity inside the cap so the launch reads instantly
    // instead of waiting for the kick to spool up.
    a.vel.x = ux * MAX_VELOCITY * 0.5;
    a.vel.y = uy * MAX_VELOCITY * 0.5;
  }
  return { cluster, x: px, y: py };
}

// Dart lifecycle. A cluster detonates when any of its atoms reaches a
// bonded non-player 'a' atom — bonded 'a' only exists inside membrane
// rings, so this is a clean enemy-membrane contact test. Detonation
// breaks the cluster's p–p bonds, scattering the payload as a lysin
// cloud that keeps grinding the breach; a single grazing pass would let
// the ring reseal. The player's own ring does not trigger detonation,
// though the armed lysin can still eat it — firing into your own wake
// is a real risk. Returns the detonating atom for logging, else null.
export function updateDarts(grid: Grid, clusters: Cell[][], now: number): Cell | null {
  for (let i = clusters.length - 1; i >= 0; i--) {
    const cluster = clusters[i];
    if (cluster[0].thrustUntilIter <= now) {
      clusters.splice(i, 1); // fuel spent — drifts as loose lysin now
      continue;
    }
    for (const atom of cluster) {
      const near = grid.getAllWithinRadius(atom.loc.x, atom.loc.y, RADIUS * 2.4);
      const hit = near.some((c) =>
        c.type === 'a' && !c.playerControlled && c.bonds.size > 0);
      if (hit) {
        for (const a of cluster) {
          a.breakAllBonds();
          a.thrustUntilIter = now; // cut thrust — scatter as a cloud
        }
        clusters.splice(i, 1);
        return atom;
      }
    }
  }
  return null;
}
