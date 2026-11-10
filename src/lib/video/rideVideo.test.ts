/**
 * Tests for the ride video plan.
 * They confirm the clip's phases and length, the camera following the cart inside the drawing, and the drawing scale.
 * They also confirm the recording format falls back from MP4 to WebM, and file names and captions.
 */
import { describe, expect, it } from "vitest";
import type { TrackStop } from "@/lib/track/types";
import {
  INTRO_SECONDS,
  OUTRO_SECONDS,
  VIDEO_SPEED,
  VIDEO_WIDTH,
  baseVideoType,
  cameraLeft,
  chooseVideoType,
  drawingScale,
  phaseAt,
  stopCaption,
  videoFileName,
  videoSeconds,
} from "./rideVideo";

describe("phases", () => {
  const ride = 30;

  it("plays an intro, the ride faster than Ride it, then the ending card", () => {
    expect(videoSeconds(ride)).toBe(INTRO_SECONDS + ride / VIDEO_SPEED + OUTRO_SECONDS);
    expect(phaseAt(0.5, ride)).toEqual({ kind: "intro" });
    expect(phaseAt(INTRO_SECONDS + 2, ride)).toEqual({ kind: "ride", elapsed: 2 * VIDEO_SPEED });
    expect(phaseAt(videoSeconds(ride) - OUTRO_SECONDS / 2, ride)).toEqual({ kind: "outro", progress: 0.5 });
    expect(phaseAt(videoSeconds(ride) + 5, ride)).toEqual({ kind: "outro", progress: 1 });
  });
});

describe("camera", () => {
  const drawing = { width: 3000, height: 600 };
  const scale = drawingScale(drawing);
  const view = VIDEO_WIDTH / scale;

  it("fills the band without blowing a small drawing up", () => {
    expect(scale).toBeCloseTo(1.8);
    expect(drawingScale({ width: 500, height: 200 })).toBe(2.2);
  });

  it("follows the cart and stays inside the drawing", () => {
    expect(cameraLeft(1500, drawing, scale)).toBeCloseTo(1500 - view * 0.4);
    expect(cameraLeft(10, drawing, scale)).toBe(0);
    expect(cameraLeft(2990, drawing, scale)).toBeCloseTo(3000 - view);
  });

  it("centres a drawing narrower than the frame", () => {
    const narrow = { width: 300, height: 600 };
    expect(cameraLeft(100, narrow, scale)).toBeCloseTo((300 - view) / 2);
  });
});

describe("formats", () => {
  it("prefers MP4 and falls back to WebM, or none", () => {
    expect(chooseVideoType(() => true)).toMatch(/^video\/mp4/);
    expect(chooseVideoType((type) => type.startsWith("video/webm"))).toBe("video/webm;codecs=vp9,opus");
    expect(chooseVideoType(() => false)).toBeNull();
  });

  it("names the file and strips codecs", () => {
    expect(videoFileName("video/mp4;codecs=avc1")).toBe("my-roller-coaster-ride.mp4");
    expect(videoFileName("video/webm")).toBe("my-roller-coaster-ride.webm");
    expect(baseVideoType("video/webm;codecs=vp9,opus")).toBe("video/webm");
  });
});

describe("stopCaption", () => {
  it("numbers the stop and shows its date and title", () => {
    const stop = { title: "Got married", date: "2022" } as TrackStop;
    expect(stopCaption(stop, 1, 5)).toEqual({ line: "Stop 2 of 5 · 2022", title: "Got married" });
    expect(stopCaption({ ...stop, date: null }, 0, 1).line).toBe("Stop 1 of 1 · Date unknown");
  });
});
