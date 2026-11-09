/**
 * The preview picture social apps show for any link to the site, including shared rides.
 * Shared rides live in the link's fragment, which a server never sees, so one picture serves every link.
 * It is drawn at build time from shapes and text, with no fonts or images fetched.
 */
import { ImageResponse } from "next/og";

export const alt = "Lifecycle Roller Coaster: turn your life story into a roller coaster";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SKY = "linear-gradient(180deg, #8fd3f4 0%, #e0f2fe 100%)";
const INK = "#0f172a";
const RAIL = "#e11d48";
const BAND = "rgba(255, 255, 255, 0.92)";
/** The rail stays in the upper part of the picture, above the text band. */
const RAIL_PATH = "M40 330 C200 330 220 90 380 90 C540 90 520 380 680 380 C840 380 860 70 1020 70 C1100 70 1140 140 1160 190";
const STOPS = [
  { x: 380, y: 90 },
  { x: 680, y: 380 },
  { x: 1020, y: 70 },
];

export default function OpenGraphImage(): ImageResponse {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: SKY }}>
        <svg width={size.width} height={size.height} style={{ position: "absolute", left: 0, top: 0 }}>
          <path d={RAIL_PATH} fill="none" stroke={RAIL} strokeWidth={14} strokeLinecap="round" />
          {STOPS.map(({ x, y }) => (
            <circle key={x} cx={x} cy={y} r={20} fill="#ffffff" stroke={INK} strokeWidth={6} />
          ))}
        </svg>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            padding: "36px 64px",
            color: INK,
            background: BAND,
          }}
        >
          <div style={{ fontSize: 72, fontWeight: 800 }}>Lifecycle Roller Coaster</div>
          <div style={{ fontSize: 36, marginTop: 12 }}>Take a ride through a life story, then make your own.</div>
        </div>
      </div>
    ),
    size,
  );
}
