/**
 * Tests for the story picture layout.
 * They confirm long rides wrap onto rows cut between stops, every row fits the card, and short rides are not blown up.
 * They also confirm cuts avoid labels and chapter names, the card's parts are stacked and centred, the title, subtitle
 * and footer text, and that user text cannot inject markup.
 */
import { describe, expect, it } from "vitest";
import type { LifeEvent } from "@/lib/events/schema";
import {
  STORY_CONTENT_WIDTH,
  STORY_HEIGHT,
  STORY_WIDTH,
  UNNAMED_STORY_TITLE,
  buildStoryCard,
  drawingHeightOf,
  storyLayout,
  storyPositions,
  storyRows,
  storySubtitle,
  titleLines,
  type StoryDrawing,
} from "./storyCard";

type Spans = StoryDrawing["keepWhole"]["words"];

function drawing(width: number, stopCount: number, words: Spans = [], scenery: Spans = []): StoryDrawing {
  const spacing = (width - 200) / Math.max(stopCount - 1, 1);
  return { width, height: 600, titleBand: 72, stopXs: Array.from({ length: stopCount }, (_, i) => 100 + i * spacing), keepWhole: { words, scenery } };
}

function event(date: string | null): LifeEvent {
  return { id: `e_${date}`, date, title: "T", description: "", category: "career", sentiment: "positive", impact: 5, confidence: 1 };
}

/** A stand-in for the browser's text measuring: wide letters, emoji and CJK take more room than others. */
const WIDE_FROM = 0x1100;
const CARD_TEXT_WIDTH = STORY_WIDTH - 120;
function measure(text: string): number {
  return Array.from(text).reduce((width, character) => {
    const code = character.codePointAt(0) ?? 0;
    return width + (code >= WIDE_FROM ? 76 : character === "W" ? 72 : 40);
  }, 0);
}

const RIDE_MARKUP = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3000 600"><rect id="sky"/></svg>';

describe("storyRows", () => {
  it("cuts halfway between neighbouring stops and covers the whole drawing", () => {
    const long = drawing(3000, 10);
    const rows = storyRows(long, 3);
    expect(rows).toHaveLength(3);
    expect(rows[0].fromX).toBe(0);
    expect(rows.at(-1)?.toX).toBe(3000);
    const midpoints = long.stopXs.slice(1).map((x, i) => (long.stopXs[i] + x) / 2);
    for (const row of rows.slice(1)) {
      expect(midpoints).toContain(row.fromX);
    }
    rows.slice(1).forEach((row, i) => expect(row.fromX).toBe(rows[i].toX));
  });

  it("moves a cut off a label or chapter name to the nearest clean gap", () => {
    const plain = storyRows(drawing(3000, 10), 2);
    const blocked = { from: plain[0].toX - 50, to: plain[0].toX + 50 };
    const rows = storyRows(drawing(3000, 10, [blocked]), 2);
    expect(rows).toHaveLength(2);
    expect(rows[0].toX).not.toBe(plain[0].toX);
    expect(rows[0].toX <= blocked.from || rows[0].toX >= blocked.to).toBe(true);
  });

  it("cuts just beside a sign hanging halfway between two stops", () => {
    const plain = storyRows(drawing(3000, 10), 2);
    const sign = { from: plain[0].toX - 37, to: plain[0].toX + 37 };
    const [first] = storyRows(drawing(3000, 10, [], [sign]), 2);
    expect([sign.from - 6, sign.to + 6]).toContain(first.toX);
  });

  it("splits a sign rather than a label when it cannot keep both whole", () => {
    const plain = storyRows(drawing(3000, 10), 2);
    const label = { from: plain[0].toX - 40, to: plain[0].toX + 40 };
    const everywhere = { from: 0, to: 3000 };
    const [first] = storyRows(drawing(3000, 10, [label], [everywhere]), 2);
    expect(first.toX <= label.from || first.toX >= label.to).toBe(true);
  });

  it("still cuts through a label when every gap is covered", () => {
    const everywhere = { from: 0, to: 3000 };
    expect(storyRows(drawing(3000, 10, [everywhere]), 2)).toEqual(storyRows(drawing(3000, 10), 2));
    expect(storyRows(drawing(3000, 10, [everywhere], [everywhere]), 2)).toEqual(storyRows(drawing(3000, 10), 2));
  });

  it("makes fewer rows when there are not enough gaps between stops", () => {
    expect(storyRows(drawing(3000, 2), 4)).toHaveLength(2);
    expect(storyRows(drawing(3000, 1), 3)).toHaveLength(1);
  });
});

describe("storyLayout", () => {
  it("wraps a long ride onto several rows that fit the card", () => {
    const long = drawing(4000, 14);
    const { rows, scale } = storyLayout(long);
    expect(rows.length).toBeGreaterThan(1);
    for (const { fromX, toX } of rows) {
      expect((toX - fromX) * scale).toBeLessThanOrEqual(STORY_WIDTH);
    }
    expect(rows.length * (long.height - long.titleBand) * scale).toBeLessThan(STORY_HEIGHT);
  });

  it("keeps at least three stops on every row", () => {
    expect(storyLayout(drawing(1200, 4)).rows).toHaveLength(1);
    const { rows } = storyLayout(drawing(4000, 14));
    const long = drawing(4000, 14);
    for (const { fromX, toX } of rows) {
      expect(long.stopXs.filter((x) => x > fromX && x < toX).length).toBeGreaterThanOrEqual(3);
    }
  });

  it("keeps a short ride on one row without blowing it up", () => {
    const { rows, scale } = storyLayout(drawing(500, 3));
    expect(rows).toHaveLength(1);
    expect(scale).toBeLessThanOrEqual(1.6);
  });
});

describe("titleLines", () => {
  it("uses a friendly title for an unnamed ride and wraps at spaces", () => {
    expect(titleLines("  ", measure, STORY_CONTENT_WIDTH)).toEqual([UNNAMED_STORY_TITLE]);
    expect(titleLines("Maya's Startup Rollercoaster", measure, STORY_CONTENT_WIDTH)).toEqual(["Maya's Startup", "Rollercoaster"]);
  });

  it("keeps at most two lines and marks a cut title", () => {
    const lines = titleLines("One two three four five six seven eight nine ten eleven twelve twelve thirteen fourteen fifteen", measure, STORY_CONTENT_WIDTH);
    expect(lines).toHaveLength(2);
    expect(lines[1].endsWith("...")).toBe(true);
  });

  it("keeps wide, CJK and emoji titles inside the card", () => {
    for (const title of ["W".repeat(22), "我的人生过山车".repeat(4), "\u{1F600}".repeat(25), "Supercalifragilisticexpialidocious"]) {
      const lines = titleLines(title, measure, STORY_CONTENT_WIDTH);
      expect(lines.length).toBeLessThanOrEqual(2);
      for (const line of lines) {
        expect(measure(line)).toBeLessThanOrEqual(CARD_TEXT_WIDTH);
      }
    }
  });
});

describe("storySubtitle", () => {
  it("names the years and the stops", () => {
    expect(storySubtitle([event("2009"), event("2025-03"), event(null)])).toBe("2009 to 2025, 3 stops");
    expect(storySubtitle([event("2020")])).toBe("2020, 1 stop");
    expect(storySubtitle([event(null), event(null)])).toBe("2 stops");
  });
});

describe("storyPositions", () => {
  it("keeps a full card with a two-line title where it always was", () => {
    expect(storyPositions(2, 1340)).toEqual({ titleTop: 150, subtitleY: 312, drawingTop: 380, footerBaseline: 1830 });
  });

  it("stacks a short ride under its subtitle and centres the stack", () => {
    const full = storyPositions(2, 1340);
    const short = storyPositions(1, 600);
    expect(short.drawingTop - short.subtitleY).toBe(full.drawingTop - full.subtitleY);
    expect(short.footerBaseline - (short.drawingTop + 600)).toBe(full.footerBaseline - (full.drawingTop + 1340));
    const above = short.titleTop - full.titleTop;
    const below = STORY_HEIGHT - short.footerBaseline - (STORY_HEIGHT - full.footerBaseline);
    expect(above).toBeGreaterThan(0);
    expect(above).toBeCloseTo(below);
  });

  it("measures the rows of a wrapped ride with their gaps", () => {
    const long = drawing(4000, 14);
    const layout = storyLayout(long);
    expect(drawingHeightOf(long, layout)).toBeGreaterThan((600 - 72) * layout.scale * layout.rows.length);
  });
});

describe("buildStoryCard", () => {
  const card = buildStoryCard({
    markup: RIDE_MARKUP,
    drawing: drawing(3000, 10),
    title: '<script>alert("x")</script> & co',
    events: [event("2010"), event("2020")],
    host: "example.com",
    measureTitle: measure,
  });

  it("is a story-sized picture with the ride rows and the footer", () => {
    expect(card).toContain(`width="${STORY_WIDTH}" height="${STORY_HEIGHT}"`);
    expect(card.match(/id="sky"/g)?.length).toBeGreaterThan(1);
    expect(card).toContain("Make your own ride at example.com");
    expect(card).toContain("2010 to 2020, 2 stops");
  });

  it("escapes the title so it cannot add markup", () => {
    expect(card).not.toContain("<script>");
    expect(card).toContain("&lt;script&gt;");
    expect(card).toContain("&amp;");
  });
});

describe("titleLines with emoji", () => {
  it("never splits an emoji, so the picture can always be encoded", () => {
    for (const title of ["\u{1F600}".repeat(25), "a\u{1F600}".repeat(12), `${"A".repeat(18)}\u{1F600}\u{1F600}`]) {
      for (const line of titleLines(title, measure, STORY_CONTENT_WIDTH)) {
        expect(() => encodeURIComponent(line)).not.toThrow();
      }
    }
  });
});

describe("the story picture in Turkish", () => {
  it("words the years, the stops and an unnamed title in Turkish", () => {
    expect(storySubtitle([event("2009"), event("2025-03"), event(null)], "tr")).toBe("2009–2025, 3 durak");
    expect(storySubtitle([event("2020")], "tr")).toBe("2020, 1 durak");
    expect(storySubtitle([event(null)], "tr")).toBe("1 durak");
    expect(titleLines(" ", measure, STORY_CONTENT_WIDTH, "tr")).toEqual(["Hayatımın Hız Treni"]);
  });

  it("puts the Turkish footer and subtitle on the card", () => {
    const card = buildStoryCard({
      markup: RIDE_MARKUP,
      drawing: drawing(3000, 10),
      title: "",
      events: [event("2010"), event("2020")],
      host: "example.com",
      measureTitle: measure,
      locale: "tr",
    });
    expect(card).toContain("Kendi trenini yap: example.com");
    expect(card).toContain("2010–2020, 2 durak");
    expect(card).toContain("Hayatımın");
    expect(card).not.toContain("Make your own ride");
  });
});
