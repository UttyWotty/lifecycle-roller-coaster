/**
 * A small picture of a theme, for the picker and the landing page.
 * It draws the same little ride in each theme's colours, with its own line and support style.
 * It keeps to plain shapes, so many can share a page without any shared gradients or filters.
 */
import type { CSSProperties, ReactElement } from "react";
import { RIDE_THEME_DETAILS, type RideTheme, type SceneryKind } from "@/lib/scene/themes";

interface ThemePreviewProps {
  theme: RideTheme;
}

interface PreviewLook {
  railWidth: number;
  postWidth: number;
  postSpacing: number;
  glow?: string;
}

const VIEW_WIDTH = 120;
const VIEW_HEIGHT = 64;
const RAIL_PATH = "M0 46 C20 46 24 14 44 14 C64 14 66 50 86 50 C102 50 108 24 120 24";
const PLAIN_RAIL = "#e11d48";
const PLAIN_POST = "#a1a1aa";
const PLAIN_SKY = "#ffffff";
const STANDARD_LOOK: PreviewLook = { railWidth: 4, postWidth: 1.5, postSpacing: 12 };
const LOOKS: Readonly<Partial<Record<SceneryKind, PreviewLook>>> = {
  toy: { railWidth: 5, postWidth: 5, postSpacing: 24 },
  neon: { railWidth: 3, postWidth: 1, postSpacing: 24, glow: "drop-shadow(0 0 3px #ff2d95)" },
  line: { railWidth: 1.5, postWidth: 1, postSpacing: 40 },
  poster: { railWidth: 4, postWidth: 1, postSpacing: 5 },
  garden: { railWidth: 6, postWidth: 2, postSpacing: 30 },
  constellation: { railWidth: 1.5, postWidth: 0, postSpacing: 120, glow: "drop-shadow(0 0 3px #fde68a)" },
};

/** Height of the little rail at a point, close enough for placing posts under it. */
function railHeightAt(x: number): number {
  return 32 + Math.cos((x / VIEW_WIDTH) * Math.PI * 3.1) * 18;
}

export function ThemePreview({ theme }: ThemePreviewProps): ReactElement {
  const { palette } = RIDE_THEME_DETAILS[theme];
  const look = (palette && LOOKS[palette.kind]) ?? STANDARD_LOOK;
  const posts = Array.from(
    { length: Math.floor(VIEW_WIDTH / look.postSpacing) },
    (_, index) => (index + 0.5) * look.postSpacing,
  );
  const background: CSSProperties = {
    background: palette ? `linear-gradient(${palette.skyTop}, ${palette.skyBottom})` : PLAIN_SKY,
  };
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      style={background}
      className="block h-auto w-full rounded-md border border-muted"
      data-testid="theme-preview"
    >
      <g stroke={palette?.steel ?? PLAIN_POST} strokeWidth={look.postWidth}>
        {posts.map((x) => (
          <line key={x} x1={x} y1={railHeightAt(x)} x2={x} y2={VIEW_HEIGHT} />
        ))}
      </g>
      <path
        d={RAIL_PATH}
        fill="none"
        stroke={palette?.rail ?? PLAIN_RAIL}
        strokeWidth={look.railWidth}
        strokeLinecap="round"
        style={look.glow ? { filter: look.glow } : undefined}
      />
    </svg>
  );
}
