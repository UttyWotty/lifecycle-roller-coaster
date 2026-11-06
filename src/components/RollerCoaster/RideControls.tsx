/**
 * Controls that make a ride personal: its title and the style it is drawn in.
 * Both choices belong to the parent, so they survive moving between stages.
 * Neither control changes the events, only how they are drawn.
 */
"use client";

import type { ReactElement } from "react";
import { FIELD_CLASS, LABEL_CLASS } from "@/components/EventReview/fieldStyles";
import { RIDE_STYLE_DETAILS } from "@/lib/track/rideStyles";
import { MAX_TITLE_LENGTH } from "@/lib/track/rideTitle";
import { RIDE_STYLES, type RideStyle } from "@/lib/track/types";

interface RideControlsProps {
  title: string;
  style: RideStyle;
  onTitleChange: (title: string) => void;
  onStyleChange: (style: RideStyle) => void;
}

const TITLE_PLACEHOLDER = "My 20s Roller Coaster";
const OPTION_CLASS =
  "flex min-h-11 flex-1 basis-48 items-start gap-2 rounded-lg border border-muted p-3 text-sm has-checked:border-accent has-checked:outline-1 has-checked:outline-accent";

export function RideControls(props: RideControlsProps): ReactElement {
  const { title, style, onTitleChange, onStyleChange } = props;
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
      <fieldset className="flex min-w-0 flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold">Ride style</legend>
        <div className="flex flex-wrap gap-2">
          {RIDE_STYLES.map((option) => (
            <label key={option} className={OPTION_CLASS}>
              <input
                type="radio"
                name="ride-style"
                checked={option === style}
                onChange={() => onStyleChange(option)}
                className="mt-0.5 accent-accent"
              />
              <span className="flex min-w-0 flex-col">
                <span className="font-semibold">{RIDE_STYLE_DETAILS[option].name}</span>
                <span className="text-muted">{RIDE_STYLE_DETAILS[option].description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
