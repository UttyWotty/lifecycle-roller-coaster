/**
 * Tests for the printable poster's layout.
 * They confirm the page is A3 landscape at print resolution, held under the canvas limit phones can paint.
 * They also confirm the drawing keeps its proportions inside the margins for long and short rides, and the title wraps.
 */
import { describe, expect, it } from "vitest";
import { MAX_CANVAS_PIXELS, POSTER_HEIGHT, POSTER_TEXT_WIDTH, POSTER_WIDTH, buildPoster, drawingBox, posterScale } from "./poster";

const MARGIN = 200;
const HEADER_BOTTOM = 600;
/** A stand-in for text measuring: every character as wide as the title size's average letter. */
const measure = (text: string): number => text.length * 100;

describe("posterScale", () => {
  it("prints near 300 dpi without passing the canvas limit", () => {
    const scale = posterScale();
    expect(POSTER_WIDTH * scale * POSTER_HEIGHT * scale).toBeLessThanOrEqual(MAX_CANVAS_PIXELS);
    const dpi = (scale * 10 * 25.4);
    expect(dpi).toBeGreaterThan(280);
    expect(dpi).toBeLessThanOrEqual(300);
  });

  it("keeps the A3 shape", () => {
    expect(POSTER_WIDTH / POSTER_HEIGHT).toBeCloseTo(420 / 297);
  });
});

describe("drawingBox", () => {
  const inside = (box: ReturnType<typeof drawingBox>): void => {
    expect(box.x).toBeGreaterThanOrEqual(MARGIN - 1e-6);
    expect(box.x + box.width).toBeLessThanOrEqual(POSTER_WIDTH - MARGIN + 1e-6);
    expect(box.y).toBeGreaterThan(HEADER_BOTTOM);
    expect(box.y + box.height).toBeLessThan(POSTER_HEIGHT - MARGIN);
  };

  it("fits a long ride to the width, keeping its proportions and centred", () => {
    const drawing = { width: 6000, height: 700, titleBand: 100, stopXs: [] };
    const box = drawingBox(drawing, HEADER_BOTTOM);
    inside(box);
    expect(box.width).toBeCloseTo(POSTER_TEXT_WIDTH);
    expect(box.width / box.height).toBeCloseTo(6000 / 600);
  });

  it("fits a short, tall ride to the height, centred across", () => {
    const drawing = { width: 800, height: 600, titleBand: 0, stopXs: [] };
    const box = drawingBox(drawing, HEADER_BOTTOM);
    inside(box);
    expect(box.width / box.height).toBeCloseTo(800 / 600);
    expect(box.x + box.width / 2).toBeCloseTo(POSTER_WIDTH / 2);
  });
});

describe("buildPoster", () => {
  const input = {
    markup: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 500"><rect id="ride" width="1000" height="500"/></svg>',
    drawing: { width: 1000, height: 500, titleBand: 50, stopXs: [] },
    title: "A <very> long title that keeps going on and on and on and on for a long time indeed",
    events: [],
    measureTitle: measure,
  };

  it("is A3 at its own units, holds the drawing without its title strip, and escapes the title", () => {
    const markup = buildPoster(input);
    expect(markup).toContain(`viewBox="0 0 ${POSTER_WIDTH} ${POSTER_HEIGHT}"`);
    expect(markup).toContain('viewBox="0 50 1000 450"');
    expect(markup).toContain('<rect id="ride"');
    expect(markup).toContain("&lt;very&gt;");
    expect(markup).not.toContain("<very>");
    expect(markup).toContain("Lifecycle Roller Coaster");
  });

  it("wraps a long title onto at most two lines that fit", () => {
    const lines = [...buildPoster(input).matchAll(/<tspan[^>]*>([^<]*)<\/tspan>/g)].map(([, line]) => line);
    expect(lines.length).toBeLessThanOrEqual(2);
    for (const line of lines) {
      expect(measure(line.replaceAll("&lt;", "<").replaceAll("&gt;", ">"))).toBeLessThanOrEqual(POSTER_TEXT_WIDTH);
    }
  });
});
