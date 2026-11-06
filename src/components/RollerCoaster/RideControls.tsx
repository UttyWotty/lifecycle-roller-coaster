/**
 * Controls that make a ride personal: its title, style, theme and rider.
 * Both choices belong to the parent, so they survive moving between stages.
 * Neither control changes the events, only how they are drawn.
 */
"use client";

import type { ReactElement } from "react";
import { CHOICE_PILL_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/EventReview/fieldStyles";
import type { Rider } from "@/lib/scene/riders";
import { RIDE_THEMES, RIDE_THEME_DETAILS, type RideTheme } from "@/lib/scene/themes";
import { RIDE_STYLE_DETAILS } from "@/lib/track/rideStyles";
import { MAX_TITLE_LENGTH } from "@/lib/track/rideTitle";
import { RIDE_STYLES, type RideStyle } from "@/lib/track/types";
import { RiderPicker } from "./RiderPicker";

interface RideControlsProps {
  title: string;
  style: RideStyle;
  theme: RideTheme;
  rider: Rider;
  /** Only rides with a cart have someone to choose. */
  hasCart: boolean;
  onTitleChange: (title: string) => void;
  onStyleChange: (style: RideStyle) => void;
  onThemeChange: (theme: RideTheme) => void;
  onRiderChange: (rider: Rider) => void;
}

const TITLE_PLACEHOLDER = "My 20s Roller Coaster";
const OPTION_CLASS =
  "flex min-h-11 flex-1 basis-48 items-start gap-2 rounded-lg border border-muted p-3 text-sm has-checked:border-accent has-checked:outline-1 has-checked:outline-accent";

export function RideControls(props: RideControlsProps): ReactElement {
  const { title, style, theme, rider, hasCart } = props;
  const { onTitleChange, onStyleChange, onThemeChange, onRiderChange } = props;
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
      <fieldset className="flex min-w-0 flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold">Theme</legend>
        <div className="flex flex-wrap gap-2">
          {RIDE_THEMES.map((option) => {
            const [from, to] = RIDE_THEME_DETAILS[option].swatch;
            return (
              <label key={option} className={CHOICE_PILL_CLASS}>
                <input
                  type="radio"
                  name="ride-theme"
                  checked={option === theme}
                  onChange={() => onThemeChange(option)}
                  className="accent-accent"
                />
                <span
                  aria-hidden="true"
                  className="size-5 rounded-full border border-muted"
                  style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                />
                {RIDE_THEME_DETAILS[option].name}
              </label>
            );
          })}
        </div>
      </fieldset>
      {hasCart && <RiderPicker rider={rider} onRiderChange={onRiderChange} />}
    </div>
  );
}
