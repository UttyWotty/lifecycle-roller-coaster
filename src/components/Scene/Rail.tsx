/**
 * The standard rail, with a solid line and small white ties.
 * It draws itself in on screen, and the ties fade in once the line has passed.
 * Modes with their own look provide a different rail through the mode registry.
 */
import type { ReactElement } from "react";
import type { ScenePalette } from "@/lib/scene/themes";

export interface RailProps {
  path: string;
  palette: ScenePalette | null;
}

export const DRAW_TEST_ID = "ride-path";

const RAIL_WIDTH = 7;
const TIE_WIDTH = 3;
const TIE_PATTERN = "2 14";

export function Rail({ path, palette }: RailProps): ReactElement {
  return (
    <>
      <path
        d={path}
        pathLength={1}
        fill="none"
        stroke={palette?.rail ?? "var(--accent)"}
        strokeWidth={RAIL_WIDTH}
        strokeLinecap="round"
        className="ride-track-draw"
        data-testid={DRAW_TEST_ID}
      />
      <path
        d={path}
        fill="none"
        stroke={palette?.pill ?? "var(--background)"}
        strokeWidth={TIE_WIDTH}
        strokeDasharray={TIE_PATTERN}
        className="ride-track-ties"
      />
    </>
  );
}
