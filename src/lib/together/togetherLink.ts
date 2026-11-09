/**
 * Pure link format for two rides shown together: "a=<ride>&b=<ride>" in the part of the link after "#".
 * Each ride uses the share-link payload, so the same privacy rules apply: no descriptions, report or story.
 * Decoding is strict and returns null unless both rides are valid.
 */
import {
  decodeRidePayload,
  encodeRidePayload,
  MAX_FRAGMENT_LENGTH,
  type SharedRide,
  type SharedRideInput,
} from "@/lib/share/sharedRide";

export interface RidePair {
  a: SharedRide;
  b: SharedRide;
}

const FIRST_KEY = "a=";
const SECOND_KEY = "b=";
const SEPARATOR = "&";
const RIDE_COUNT = 2;

export function encodeTogether(a: SharedRideInput, b: SharedRideInput): string {
  return `${FIRST_KEY}${encodeRidePayload(a)}${SEPARATOR}${SECOND_KEY}${encodeRidePayload(b)}`;
}

/** Reads a pair from a fragment, with or without its leading "#", or null when either ride is not valid. */
export function decodeTogether(fragment: string): RidePair | null {
  const body = fragment.replace(/^#/, "");
  if (body.length > MAX_FRAGMENT_LENGTH * RIDE_COUNT) {
    return null;
  }
  const parts = body.split(SEPARATOR);
  if (parts.length !== RIDE_COUNT || !parts[0].startsWith(FIRST_KEY) || !parts[1].startsWith(SECOND_KEY)) {
    return null;
  }
  const a = decodeRidePayload(parts[0].slice(FIRST_KEY.length));
  const b = decodeRidePayload(parts[1].slice(SECOND_KEY.length));
  return a && b ? { a, b } : null;
}
