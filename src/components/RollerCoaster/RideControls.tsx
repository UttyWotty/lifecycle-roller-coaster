/**
 * Controls that make a ride personal: its title and who rides it.
 * Both choices belong to the parent, so they survive moving between stages.
 * Neither control changes the events, only how they are drawn.
 */
"use client";

import type { ReactElement } from "react";
import { FIELD_CLASS, LABEL_CLASS } from "@/components/EventReview/fieldStyles";
import type { Rider } from "@/lib/scene/riders";
import { MAX_TITLE_LENGTH } from "@/lib/track/rideTitle";
import { RiderPicker } from "./RiderPicker";

interface RideControlsProps {
  title: string;
  /** The title the drawing shows when the ride is unnamed, such as the lens title, or null when it shows none. */
  suggestedTitle: string | null;
  rider: Rider;
  /** Only rides with a cart have someone to choose. */
  hasCart: boolean;
  onTitleChange: (title: string) => void;
  onRiderChange: (rider: Rider) => void;
}

/** An example name for a ride whose drawing has no title yet. */
const TITLE_EXAMPLE = "My Life Roller Coaster";

export function RideControls(props: RideControlsProps): ReactElement {
  const { title, suggestedTitle, rider, hasCart, onTitleChange, onRiderChange } = props;
  return (
    <div className="flex flex-col gap-4">
      <label className={LABEL_CLASS}>
        Name your ride
        <input
          type="text"
          value={title}
          maxLength={MAX_TITLE_LENGTH}
          placeholder={suggestedTitle ?? TITLE_EXAMPLE}
          onChange={(event) => onTitleChange(event.target.value)}
          className={FIELD_CLASS}
        />
      </label>
      {hasCart && <RiderPicker rider={rider} onRiderChange={onRiderChange} />}
    </div>
  );
}
