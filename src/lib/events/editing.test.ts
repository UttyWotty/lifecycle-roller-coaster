/**
 * Tests for the event review operations.
 * They cover adding, updating, deleting, reordering, sorting and validation.
 * They also confirm that a user's own changes settle an uncertain AI reading.
 */
import { describe, expect, it } from "vitest";
import {
  DEFAULT_IMPACT,
  addBlankEvent,
  confirmEvent,
  deleteEvent,
  findInvalidFields,
  formatEventId,
  moveEvent,
  restoreEvent,
  sortEventsByDate,
  updateEvent,
} from "./editing";
import { lifeEventListSchema, type LifeEvent } from "./schema";

function makeEvent(id: string, over: Partial<LifeEvent> = {}): LifeEvent {
  return {
    id,
    date: "2015",
    title: `Title ${id}`,
    description: "",
    category: "other",
    sentiment: "neutral",
    impact: 5,
    confidence: 0.4,
    ...over,
  };
}

const EVENTS = [makeEvent("event_001"), makeEvent("event_002"), makeEvent("event_003")];
const ids = (events: LifeEvent[]): string[] => events.map(({ id }) => id);

describe("formatEventId", () => {
  it("pads short numbers and keeps long ones", () => {
    expect(formatEventId(7)).toBe("event_007");
    expect(formatEventId(1234)).toBe("event_1234");
  });
});

describe("addBlankEvent", () => {
  it("creates the first event in an empty list", () => {
    const [event] = addBlankEvent([]);
    expect(event).toMatchObject({ id: "event_001", date: null, impact: DEFAULT_IMPACT, confidence: 1 });
  });

  it("numbers past the highest id in use", () => {
    expect(ids(addBlankEvent(deleteEvent(EVENTS, "event_002"))).at(-1)).toBe("event_004");
  });

  it("keeps ids unique across repeated adds", () => {
    const events = addBlankEvent(addBlankEvent(EVENTS));
    const named = events.map((event) => ({ ...event, title: "Named" }));
    expect(lifeEventListSchema.safeParse({ events: named }).success).toBe(true);
  });
});

describe("updateEvent", () => {
  it("changes only the targeted event", () => {
    const updated = updateEvent(EVENTS, "event_002", { title: "New" });
    expect(updated[1].title).toBe("New");
    expect(updated[0]).toBe(EVENTS[0]);
  });

  it("keeps sentiment and impact independent", () => {
    const updated = updateEvent(EVENTS, "event_001", { impact: 10 });
    expect(updated[0]).toMatchObject({ impact: 10, sentiment: "neutral" });
    expect(updateEvent(EVENTS, "event_001", { sentiment: "negative" })[0].impact).toBe(5);
  });

  it.each([{ date: "2016" }, { date: null }, { sentiment: "positive" as const }, { impact: 9 }])(
    "settles the reading when changing %j",
    (patch) => {
      expect(updateEvent(EVENTS, "event_001", patch)[0].confidence).toBe(1);
    },
  );

  it.each([{ title: "New" }, { description: "New" }, { category: "health" as const }])(
    "leaves the reading uncertain when changing %j",
    (patch) => {
      expect(updateEvent(EVENTS, "event_001", patch)[0].confidence).toBe(0.4);
    },
  );

  it("does not mutate the original list", () => {
    updateEvent(EVENTS, "event_001", { impact: 1 });
    expect(EVENTS[0].impact).toBe(5);
  });
});

describe("confirmEvent", () => {
  it("settles only the targeted event", () => {
    const confirmed = confirmEvent(EVENTS, "event_002");
    expect(confirmed.map(({ confidence }) => confidence)).toEqual([0.4, 1, 0.4]);
  });
});

describe("restoreEvent", () => {
  const removed = EVENTS[1];
  const remaining = deleteEvent(EVENTS, removed.id);

  it("puts the event back in its old position", () => {
    expect(ids(restoreEvent(remaining, removed, 1))).toEqual(ids(EVENTS));
  });

  it("keeps edits made to other events after the deletion", () => {
    const edited = updateEvent(remaining, "event_001", { title: "Edited" });
    expect(restoreEvent(edited, removed, 1)[0].title).toBe("Edited");
  });

  it("goes to the end when the list has become shorter", () => {
    const shorter = deleteEvent(remaining, "event_003");
    expect(ids(restoreEvent(shorter, removed, 2))).toEqual(["event_001", "event_002"]);
  });

  it("gets a new id when its old one was reused, so ids stay unique", () => {
    const last = EVENTS[2];
    const withNewEvent = addBlankEvent(deleteEvent(EVENTS, last.id));
    const named = withNewEvent.map((event) => ({ ...event, title: event.title || "New" }));
    const restored = restoreEvent(named, last, 2);
    expect(restored).toHaveLength(4);
    expect(restored[2].title).toBe(last.title);
    expect(lifeEventListSchema.safeParse({ events: restored }).success).toBe(true);
  });
});

describe("moveEvent", () => {
  it("moves an event up and down", () => {
    expect(ids(moveEvent(EVENTS, "event_002", -1))).toEqual(["event_002", "event_001", "event_003"]);
    expect(ids(moveEvent(EVENTS, "event_002", 1))).toEqual(["event_001", "event_003", "event_002"]);
  });

  it("leaves the order alone at the ends and for unknown ids", () => {
    expect(ids(moveEvent(EVENTS, "event_001", -1))).toEqual(ids(EVENTS));
    expect(ids(moveEvent(EVENTS, "event_003", 1))).toEqual(ids(EVENTS));
    expect(ids(moveEvent(EVENTS, "missing", 1))).toEqual(ids(EVENTS));
  });
});

describe("sortEventsByDate", () => {
  it("sorts oldest first, puts partial dates first, and leaves undated events last", () => {
    const events = [
      makeEvent("a", { date: null }),
      makeEvent("b", { date: "2020-03" }),
      makeEvent("c", { date: "2015" }),
      makeEvent("d", { date: "2020" }),
      makeEvent("e", { date: "2020-03-01" }),
    ];
    expect(ids(sortEventsByDate(events))).toEqual(["c", "d", "b", "e", "a"]);
  });

  it("keeps the order of undated events and of equal dates", () => {
    const events = [
      makeEvent("a", { date: null }),
      makeEvent("b", { date: null }),
      makeEvent("c"),
      makeEvent("d"),
    ];
    expect(ids(sortEventsByDate(events))).toEqual(["c", "d", "a", "b"]);
  });
});

describe("findInvalidFields", () => {
  it("is empty for valid events", () => {
    expect(findInvalidFields(EVENTS)).toEqual({});
  });

  it("names the title and date problems for the right event", () => {
    const events = [EVENTS[0], makeEvent("event_002", { title: "", date: "2015-02-31" })];
    expect(findInvalidFields(events)).toEqual({ event_002: ["date", "title"] });
  });
});
