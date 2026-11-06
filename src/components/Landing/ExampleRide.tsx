/**
 * Static illustration of a sample roller coaster for the landing page.
 * It uses a fictional life story to show what a finished ride looks like.
 * The track is hand-drawn here and is separate from the real rendering engine.
 */
import type { ReactElement } from "react";

interface RideStop {
  x: number;
  y: number;
  label: string;
  labelX: number;
  labelY: number;
  anchor: "middle" | "end";
}

const VIEW_BOX = "0 0 640 240";
const STOP_RADIUS = 8;
const TRACK_WIDTH = 6;
const LABEL_SIZE = 18;
const TRACK_PATH =
  "M20 170 C70 170 90 70 130 70 S240 190 290 190 S370 60 420 60 S460 170 500 170 S560 40 600 40";

const RIDE_STOPS: readonly RideStop[] = [
  { x: 130, y: 70, label: "Started university", labelX: 130, labelY: 50, anchor: "middle" },
  { x: 290, y: 190, label: "Lost a job", labelX: 290, labelY: 222, anchor: "middle" },
  { x: 420, y: 60, label: "Got married", labelX: 420, labelY: 40, anchor: "middle" },
  { x: 500, y: 170, label: "Money crisis", labelX: 500, labelY: 202, anchor: "middle" },
  { x: 600, y: 40, label: "Built a company", labelX: 620, labelY: 20, anchor: "end" },
];

const DESCRIPTION =
  "An example roller-coaster track that rises at happy life events and drops at hard ones.";

export function ExampleRide(): ReactElement {
  return (
    <svg viewBox={VIEW_BOX} role="img" aria-label={DESCRIPTION} className="h-auto w-full">
      <path
        d={TRACK_PATH}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={TRACK_WIDTH}
        strokeLinecap="round"
      />
      {RIDE_STOPS.map((stop) => (
        <g key={stop.label}>
          <circle cx={stop.x} cy={stop.y} r={STOP_RADIUS} fill="var(--foreground)" />
          <text
            x={stop.labelX}
            y={stop.labelY}
            textAnchor={stop.anchor}
            fontSize={LABEL_SIZE}
            fill="currentColor"
          >
            {stop.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
