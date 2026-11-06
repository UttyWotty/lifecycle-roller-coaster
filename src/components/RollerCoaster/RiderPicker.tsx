/**
 * Picker for the character who rides the cart.
 * Each option shows a small drawing of the character next to its name.
 * The choice belongs to the parent, so it survives moving between stages.
 */
"use client";

import type { ReactElement } from "react";
import { CHOICE_PILL_CLASS } from "@/components/EventReview/fieldStyles";
import { RiderArt } from "@/components/Scene/RiderArt";
import { RIDERS, RIDER_NAMES, type Rider } from "@/lib/scene/riders";

interface RiderPickerProps {
  rider: Rider;
  onRiderChange: (rider: Rider) => void;
}

const PREVIEW_VIEW_BOX = "-20 -21 40 36";

export function RiderPicker({ rider, onRiderChange }: RiderPickerProps): ReactElement {
  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="mb-1 text-sm font-semibold">Choose your character</legend>
      <div className="flex flex-wrap gap-2">
        {RIDERS.map((option) => (
          <label key={option} className={CHOICE_PILL_CLASS}>
            <input
              type="radio"
              name="ride-rider"
              checked={option === rider}
              onChange={() => onRiderChange(option)}
              className="accent-accent"
            />
            <svg aria-hidden="true" viewBox={PREVIEW_VIEW_BOX} className="size-8 rounded-full bg-sky-200">
              <RiderArt rider={option} />
            </svg>
            {RIDER_NAMES[option]}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
