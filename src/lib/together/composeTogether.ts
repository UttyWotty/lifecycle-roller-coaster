/**
 * Builds the drawings of a ride together, two to four rides lined up on one timeline with exactly the same width.
 * It aligns the events, gives each ride its stop positions, and redraws all at the widest width if a title made one wider.
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
  rides: ComposedRide[];
}

function composeAll(
  shared: readonly SharedRide[],
  aligned: AlignedRides,
  style: TogetherStyle,
  theme: RideTheme,
  minWidth: number,
): ComposedRide[] {
  return shared.map((ride, index) =>
    composeRide(ride.events, {
      style,
      theme,
      title: ride.title,
      rider: ride.rider,
      chapters: ride.chapters,
      layout: { positions: aligned.positions[index], minWidth },
    }),
  );
}

export function composeTogether(shared: readonly SharedRide[], style: TogetherStyle, theme: RideTheme): ComposedTogether {
  const aligned = alignRides(shared.map(({ events }) => events), { firstX: COASTER_FIRST_X, ...coasterSpacing(style) });
  const first = composeAll(shared, aligned, style, theme, aligned.lastX + COASTER_END_ROOM);
  const widths = first.map(({ track }) => track.width);
  const widest = Math.max(...widths);
  const rides = widths.every((width) => width === widest) ? first : composeAll(shared, aligned, style, theme, widest);
  return { aligned, rides };
}
