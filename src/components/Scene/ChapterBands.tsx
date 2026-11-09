/**
 * Life chapters drawn as named bands along the bottom of a ride.
 * They are part of the drawing, so chapters also appear in the exported image.
 * Long names are shortened to fit their band.
 */
import type { ReactElement } from "react";
import { chapterStripColors } from "@/lib/scene/chapterStrip";
import type { ScenePalette } from "@/lib/scene/themes";
import { CHAPTER_BAND_HEIGHT } from "@/lib/track/rideChapters";
import type { Track } from "@/lib/track/types";

interface ChapterBandsProps {
  track: Track;
  palette: ScenePalette | null;
}

const BAND_GAP = 6;
const BAND_RADIUS = 10;
const TEXT_SIZE = 14;
const TEXT_DROP = 5;
const CHARACTER_WIDTH = 8;
const ELLIPSIS = "...";

function fitTitle(title: string, width: number): string {
  const room = Math.floor(width / CHARACTER_WIDTH);
  return title.length <= room ? title : `${title.slice(0, Math.max(room - ELLIPSIS.length, 1)).trimEnd()}${ELLIPSIS}`;
}

export function ChapterBands({ track, palette }: ChapterBandsProps): ReactElement {
  const bottom = track.height - track.contentOffset;
  const top = bottom - CHAPTER_BAND_HEIGHT;
  const middle = top + CHAPTER_BAND_HEIGHT / 2;
  const strip = palette ? chapterStripColors(palette) : null;
  return (
    <g data-testid="chapter-bands">
      <rect y={top} width={track.width} height={CHAPTER_BAND_HEIGHT} fill={strip?.fill ?? "var(--background)"} />
      {track.chapterBands.map(({ title, start, end }) => (
        <g key={`${title}-${start}`}>
          <rect
            x={start + BAND_GAP / 2}
            y={top + BAND_GAP}
            width={end - start - BAND_GAP}
            height={CHAPTER_BAND_HEIGHT - BAND_GAP * 2}
            rx={BAND_RADIUS}
            fill="none"
            stroke={strip?.ink ?? "currentColor"}
            strokeWidth={2}
          />
          <text
            x={(start + end) / 2}
            y={middle + TEXT_DROP}
            textAnchor="middle"
            fontSize={TEXT_SIZE}
            fontWeight={700}
            fill={strip?.ink ?? "currentColor"}
          >
            {fitTitle(title, end - start)}
          </text>
        </g>
      ))}
    </g>
  );
}
