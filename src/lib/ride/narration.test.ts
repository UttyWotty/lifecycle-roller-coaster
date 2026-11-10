/**
 * Tests for the narrated ride's words.
 * They confirm dates are written the way people say them, and an unknown or odd date never breaks the line.
 * They also confirm each stop's line gives its place, date and title, ending as one sentence.
 */
import { describe, expect, it } from "vitest";
import { NARRATION_END, narrationEnd, narrationFor, spokenDate } from "./narration";

describe("spokenDate", () => {
  it("says years, months and days the way people do", () => {
    expect(spokenDate("2015")).toBe("2015");
    expect(spokenDate("2015-03")).toBe("March 2015");
    expect(spokenDate("2015-03-07")).toBe("7 March 2015");
    expect(spokenDate(null)).toBe("Date unknown");
  });

  it("falls back to the year for a month that does not exist", () => {
    expect(spokenDate("2015-13")).toBe("2015");
  });
});

describe("narrationFor", () => {
  it("gives the stop's place, date and title as sentences", () => {
    expect(narrationFor({ title: "Started university", date: "2015" }, 0, 7)).toBe("Stop 1 of 7. 2015. Started university.");
    expect(narrationFor({ title: "We won!", date: null }, 6, 7)).toBe("Stop 7 of 7. Date unknown. We won!");
  });

  it("ends the ride with its own line", () => {
    expect(NARRATION_END).toBe("End of the ride.");
  });
});

describe("narration in Turkish", () => {
  it("says dates, stops and the ending in Turkish", () => {
    expect(spokenDate("2015-03", "tr")).toBe("Mart 2015");
    expect(spokenDate("2015-08-07", "tr")).toBe("7 Ağustos 2015");
    expect(spokenDate(null, "tr")).toBe("Tarih yok");
    expect(narrationFor({ title: "Üniversiteye başladım", date: "2015" }, 0, 7, "tr")).toBe("Durak 1, toplam 7. 2015. Üniversiteye başladım.");
    expect(narrationEnd("tr")).toBe("Yolculuğun sonu.");
    expect(narrationEnd()).toBe(NARRATION_END);
  });
});
