/**
 * Pure link format for two to four rides shown together: "a=<ride>&b=<ride>", then "&c=" and "&d=" for a group,
 * in the part of the link after "#". Each ride uses the share-link payload, so the same privacy rules apply.
 * Decoding is strict and returns null unless every ride is valid and the keys come in order.
 */
import {
  decodeRidePayload,
  encodeRidePayload,
  MAX_FRAGMENT_LENGTH,
  type SharedRide,
  type SharedRideInput,
} from "@/lib/share/sharedRide";

/** The keys of each ride in a link, in order; their number sets how many rides can ride together. */
const RIDE_KEYS = ["a=", "b=", "c=", "d="] as const;
export const MIN_TOGETHER_RIDES = 2;
export const MAX_TOGETHER_RIDES = RIDE_KEYS.length;
const SEPARATOR = "&";

/** The link fragment for these rides; only the first MAX_TOGETHER_RIDES are kept. */
export function encodeTogether(rides: readonly SharedRideInput[]): string {
  return rides
    .slice(0, MAX_TOGETHER_RIDES)
    .map((ride, index) => `${RIDE_KEYS[index]}${encodeRidePayload(ride)}`)
    .join(SEPARATOR);
}

/** Reads the rides from a fragment, with or without its leading "#", or null when any of them is not valid. */
export function decodeTogether(fragment: string): SharedRide[] | null {
  const body = fragment.replace(/^#/, "");
  if (body.length > MAX_FRAGMENT_LENGTH * MAX_TOGETHER_RIDES) {
    return null;
  }
  const parts = body.split(SEPARATOR);
  if (parts.length < MIN_TOGETHER_RIDES || parts.length > MAX_TOGETHER_RIDES) {
    return null;
  }
  const rides: SharedRide[] = [];
  for (const [index, part] of parts.entries()) {
    const key = RIDE_KEYS[index];
    const ride = part.startsWith(key) ? decodeRidePayload(part.slice(key.length)) : null;
    if (ride === null) {
      return null;
    }
    rides.push(ride);
  }
  return rides;
}
