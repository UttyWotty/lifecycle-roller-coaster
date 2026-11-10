/**
 * Tests for the shelf of rides saved on the device.
 * They confirm rides round-trip, a bad or repeated entry is dropped alone, and a corrupt shelf reads as empty.
 * They also confirm the shelf's limit, removing the open ride, moving an older single save, and the list's names.
 */
import { describe, expect, it } from "vitest";
import { SAMPLE_LIVES } from "@/lib/samples/sampleLives";
import {
  EMPTY_SHELF,
  MAX_SAVED_RIDES,
  UNTITLED_RIDE,
  activeRide,
  isShelfFull,
  openRide,
  parseShelf,
  putRide,
  removeRide,
  serializeShelf,
  shelfFromSingle,
  summarize,
  type RideShelf,
} from "./rideShelf";
import { toSavedRide, type SavedRide } from "./savedRide";

const YEAR = 2026;
const [sample] = SAMPLE_LIVES;

function ride(title: string): SavedRide {
  const saved = toSavedRide({
    events: sample.events, chapters: sample.chapters, report: sample.report, clarifications: [], isDemo: false,
    title, style: "coaster", theme: "sunny", rider: "cat", fitToScreen: false, lens: "whole", birthYear: null,
  });
  if (saved === null) {
    throw new TypeError("the sample ride should be valid");
  }
  return saved;
}

function shelfOf(count: number): RideShelf {
  let shelf = EMPTY_SHELF;
  for (let index = 0; index < count; index += 1) {
    shelf = putRide(shelf, `r${index}`, ride(`Ride ${index}`), index);
  }
  return openRide(shelf, "r0");
}

describe("parseShelf and serializeShelf", () => {
  it("bring the same shelf back", () => {
    const shelf = shelfOf(3);
    expect(parseShelf(serializeShelf(shelf), YEAR)).toEqual(shelf);
  });

  it("read anything corrupt as an empty shelf, never throwing", () => {
    for (const text of [null, "{broken", "null", "[]", '{"version":2,"activeId":null,"rides":[]}', '{"version":1}']) {
      expect(parseShelf(text, YEAR)).toEqual(EMPTY_SHELF);
    }
  });

  it("drop a bad or repeated ride alone and keep the rest", () => {
    const data = JSON.parse(serializeShelf(shelfOf(2)));
    data.rides.push({ id: "bad", savedAt: 5, ride: { version: 1, events: [] } });
    data.rides.push({ ...data.rides[0] });
    const read = parseShelf(JSON.stringify(data), YEAR);
    expect(read.rides.map(({ id }) => id)).toEqual(["r0", "r1"]);
  });

  it("keep no more than the limit, even from a tampered shelf", () => {
    const data = JSON.parse(serializeShelf(shelfOf(MAX_SAVED_RIDES)));
    data.rides.push({ ...data.rides[0], id: "extra" });
    expect(parseShelf(JSON.stringify(data), YEAR).rides).toHaveLength(MAX_SAVED_RIDES);
  });
});

describe("changing the shelf", () => {
  it("replaces a ride saved under the same id and adds a new one", () => {
    const shelf = putRide(shelfOf(2), "r1", ride("Renamed"), 9);
    expect(shelf.rides.map(({ ride: saved }) => saved.title)).toEqual(["Ride 0", "Renamed"]);
    expect(putRide(shelf, "new", ride("New"), 10).rides).toHaveLength(3);
  });

  it("does not add a new ride to a full shelf, but still saves one already on it", () => {
    const full = shelfOf(MAX_SAVED_RIDES);
    expect(isShelfFull(full)).toBe(true);
    expect(putRide(full, "new", ride("New"), 99)).toBe(full);
    expect(activeRide(putRide(full, "r0", ride("Edited"), 99))?.title).toBe("Edited");
  });

  it("leaves no ride open after removing the open one", () => {
    const shelf = removeRide(shelfOf(2), "r0");
    expect(shelf.activeId).toBeNull();
    expect(activeRide(shelf)).toBeNull();
    expect(removeRide(shelfOf(2), "r1").activeId).toBe("r0");
  });

  it("moves an older single save onto an empty shelf as the open ride", () => {
    expect(shelfFromSingle(null, "x", 1)).toEqual(EMPTY_SHELF);
    expect(activeRide(shelfFromSingle(ride("Old"), "x", 1))?.title).toBe("Old");
  });
});

describe("summarize", () => {
  it("lists the newest first, names untitled rides, and marks the open one", () => {
    const shelf = openRide(putRide(shelfOf(2), "blank", ride("  "), 50), "r1");
    const list = summarize(shelf);
    expect(list.map(({ name }) => name)).toEqual([UNTITLED_RIDE, "Ride 1", "Ride 0"]);
    expect(list.find(({ isOpen }) => isOpen)?.id).toBe("r1");
    expect(list[0].stopCount).toBe(sample.events.length);
    expect(list[0].years).toMatch(/^\d{4}( to \d{4})?$/);
  });
});
