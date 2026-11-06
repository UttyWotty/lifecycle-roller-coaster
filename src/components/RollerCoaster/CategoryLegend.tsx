/**
 * Legend that explains the marker colours on the track.
 * It lists only the categories the ride actually uses.
 * The component is display only and holds no state.
 */
import type { ReactElement } from "react";
import { toLabel } from "@/components/EventReview/fieldStyles";
import { EVENT_CATEGORIES, type LifeEvent } from "@/lib/events/schema";
import { CATEGORY_COLORS } from "@/lib/track/categoryColors";

interface CategoryLegendProps {
  events: readonly LifeEvent[];
}

export function CategoryLegend({ events }: CategoryLegendProps): ReactElement {
  const used = EVENT_CATEGORIES.filter((category) =>
    events.some((event) => event.category === category),
  );
  return (
    <ul aria-label="Marker colours" className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
      {used.map((category) => (
        <li key={category} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="size-3 rounded-full"
            style={{ backgroundColor: CATEGORY_COLORS[category] }}
          />
          {toLabel(category)}
        </li>
      ))}
    </ul>
  );
}
