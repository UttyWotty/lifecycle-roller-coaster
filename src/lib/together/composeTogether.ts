/**
 * Builds the two drawings of a ride together, lined up on one timeline with exactly the same width.
 * It aligns the events, gives each ride its stop positions, and redraws both at the wider width if a title made one wider.
 * The rides keep their own riders and chapters, and share one style and theme.
 */
import { composeRide, type ComposedRide } from "@/lib/scene/composeRide";
import type { RideTheme } from "@/lib/scene/themes";
import type { SharedRide } from "@/lib/share/sharedRide";
import { alignRides, type AlignedRides } from "@/lib/together/alignRides";
import { COASTER_END_ROOM, COASTER_FIRST_X, coasterSpacing } from "@/lib/track/buildTrack";

export type TogetherStyle = "coaster" | "loops";

export interface ComposedTogether {
  aligned: AlignedRides;
  rides: readonly [ComposedRide, ComposedRide];
}

function composeBoth(
  pair: readonly [SharedRide, SharedRide],
  aligned: AlignedRides,
  style: TogetherStyle,
  theme: RideTheme,
  minWidth: number,
): [ComposedRide, ComposedRide] {
  const positions = [aligned.positionsA, aligned.positionsB];
  const [a, b] = pair.map((ride, index) =>
    composeRide(ride.events, {
      style,
      theme,
      title: ride.title,
      rider: ride.rider,
      chapters: ride.chapters,
      layout: { positions: positions[index], minWidth },
    }),
  );
  return [a, b];
}

export function composeTogether(pair: readonly [SharedRide, SharedRide], style: TogetherStyle, theme: RideTheme): ComposedTogether {
  const aligned = alignRides(pair[0].events, pair[1].events, { firstX: COASTER_FIRST_X, ...coasterSpacing(style) });
  const first = composeBoth(pair, aligned, style, theme, aligned.lastX + COASTER_END_ROOM);
  const widest = Math.max(first[0].track.width, first[1].track.width);
  const rides = first[0].track.width === first[1].track.width ? first : composeBoth(pair, aligned, style, theme, widest);
  return { aligned, rides };
}
