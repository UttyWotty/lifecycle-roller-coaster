/**
 * Track map: a life printed as a minimalist ride poster, one thin white line on black inside a fine frame.
 * Under the line runs a spec sheet like a ride's fact plate, with the years, stops, highest and lowest moments and big
 * moves, its labels in the visitor's language. The layout is original and owes nothing to any real poster or park.
 */
import type { ReactElement } from "react";
import { useLocale, useT } from "@/components/I18n/useLocale";
import type { MessageKey } from "@/lib/i18n/messages";
import type { Scene } from "@/lib/scene/composeRide";
import { specCells, type SpecFact } from "@/lib/scene/specSheet";
import type { ScenePalette } from "@/lib/scene/themes";
import type { Track } from "@/lib/track/types";
import { DRAW_TEST_ID, type RailProps } from "../Rail";

const FRAME_INSET = 12;
const FRAME_WIDTH = 1;
const FRAME_COLOR = "#3f3f46";
const RULE_DROP = 22;
const RULE_WIDTH = 1;
const LABEL_DROP = 42;
const LABEL_SIZE = 10;
const LABEL_SPACING = 1.6;
const VALUE_DROP = 62;
const VALUE_SIZE = 14;
const RAIL_WIDTH = 3;
const FACT_LABELS: Readonly<Record<SpecFact, MessageKey>> = {
  years: "look.specYears",
  stops: "look.specStops",
  highest: "look.specHighest",
  lowest: "look.specLowest",
  bigMoves: "look.specBigMoves",
};

function SpecSheet({ track, palette }: { track: Track; palette: ScenePalette }): ReactElement {
  const t = useT();
  const locale = useLocale();
  const ground = track.contentOffset + track.groundY;
  return (
    <g data-testid="trackmap-spec">
      <line x1={FRAME_INSET * 2} y1={ground + RULE_DROP} x2={track.width - FRAME_INSET * 2} y2={ground + RULE_DROP} stroke={palette.muted} strokeWidth={RULE_WIDTH} />
      {specCells(track.stops).map(({ fact, x, value }) => (
        <g key={fact} data-testid="trackmap-fact" data-fact={fact}>
          <text x={x} y={ground + LABEL_DROP} textAnchor="middle" fontSize={LABEL_SIZE} fontWeight={700} letterSpacing={LABEL_SPACING} fill={palette.muted}>
            {t(FACT_LABELS[fact]).toLocaleUpperCase(locale)}
          </text>
          <text x={x} y={ground + VALUE_DROP} textAnchor="middle" fontSize={VALUE_SIZE} fontWeight={700} fill={palette.title}>
            {value}
          </text>
        </g>
      ))}
    </g>
  );
}

export function TrackMapBackdrop({ scene, track }: { scene: Scene; track: Track }): ReactElement {
  const { palette } = scene;
  const { width, height } = track;
  return (
    <g aria-hidden="true" data-testid="mode-backdrop">
      <rect width={width} height={height} fill={palette.skyTop} data-testid="scene-sky" />
      <rect x={FRAME_INSET} y={FRAME_INSET} width={width - FRAME_INSET * 2} height={height - FRAME_INSET * 2} fill="none" stroke={FRAME_COLOR} strokeWidth={FRAME_WIDTH} data-testid="trackmap-frame" />
      <SpecSheet track={track} palette={palette} />
    </g>
  );
}

/** The poster shows only the line, so there is no structure under it. */
export function TrackMapStructure(): ReactElement {
  return <g aria-hidden="true" data-testid="mode-structure" />;
}

export function TrackMapRail({ path, palette }: RailProps): ReactElement {
  return (
    <path d={path} pathLength={1} fill="none" stroke={palette?.rail} strokeWidth={RAIL_WIDTH} strokeLinecap="round" strokeLinejoin="round" className="ride-track-draw" data-testid={DRAW_TEST_ID} />
  );
}
