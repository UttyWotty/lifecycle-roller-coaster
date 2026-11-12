/**
 * Pure layout for the Building blocks look: the brick columns under the rail and the brick trees on the baseplate.
 * Columns are stacked from the baseplate upward and stop a little short of the rail, so a column never pokes through it.
 * Bricks take colours in a fixed turn and trees stand at a fixed rhythm, so redraws never flicker.
 */

export interface Brick {
  y: number;
  /** Which of the brick colours this one takes, in turn. */
  tint: number;
}

export interface BrickTree {
  x: number;
  /** How many layers of leaves the tree has. */
  layers: number;
}

export const BRICK_HEIGHT = 14;
export const BRICK_TINTS = 2;
/** A column stops this far below the rail, leaving room for the rail's own thickness. */
export const RAIL_CLEARANCE = 6;
/** One tree for every stretch this wide, sized in turn from these layer counts. */
export const TREE_SPACING = 340;
export const TREE_LAYERS = [3, 2, 4];
const HALF = 2;

/** The bricks in one column, top first, from just under the rail down to the baseplate. */
export function brickColumn(railY: number, groundY: number): Brick[] {
  const count = Math.max(0, Math.floor((groundY - railY - RAIL_CLEARANCE) / BRICK_HEIGHT));
  return Array.from({ length: count }, (_, index) => {
    const fromGround = count - 1 - index;
    return { y: groundY - (fromGround + 1) * BRICK_HEIGHT, tint: fromGround % BRICK_TINTS };
  });
}

/** Trees spread along the baseplate, each in the middle of its own stretch. */
export function brickTrees(width: number): BrickTree[] {
  const count = Math.max(1, Math.floor(width / TREE_SPACING));
  const stretch = width / count;
  return Array.from({ length: count }, (_, index) => ({
    x: stretch * index + stretch / HALF,
    layers: TREE_LAYERS[index % TREE_LAYERS.length],
  }));
}
