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
  rider: Rider;
  /** Only rides with a cart have someone to choose. */
  hasCart: boolean;
  onTitleChange: (title: string) => void;
  onRiderChange: (rider: Rider) => void;
}

const TITLE_PLACEHOLDER = "My 20s Roller Coaster";

export function RideControls(props: RideControlsProps): ReactElement {
  const { title, rider, hasCart, onTitleChange, onRiderChange } = props;
  return (
    <div className="flex flex-col gap-4">
      <label className={LABEL_CLASS}>
        Name your ride
        <input
          type="text"
          value={title}
          maxLength={MAX_TITLE_LENGTH}
          placeholder={TITLE_PLACEHOLDER}
          onChange={(event) => onTitleChange(event.target.value)}
          className={FIELD_CLASS}
        />
      </label>
      {hasCart && <RiderPicker rider={rider} onRiderChange={onRiderChange} />}
    </div>
  );
}
