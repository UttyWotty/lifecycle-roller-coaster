/**
 * Compact bar for choosing a ride's style and theme, right above the drawing.
 * On wide screens it stays pinned while the page scrolls, so a choice and its result stay in view.
 * Neither control changes the events, only how they are drawn.
 */
"use client";

import type { ReactElement } from "react";
import { CHOICE_PILL_CLASS } from "@/components/EventReview/fieldStyles";
import type { RideTheme } from "@/lib/scene/themes";
import { RIDE_STYLE_DETAILS } from "@/lib/track/rideStyles";
import { RIDE_STYLES, type RideStyle } from "@/lib/track/types";
import { ThemePicker } from "./ThemePicker";

interface RideLookBarProps {
  style: RideStyle;
  theme: RideTheme;
  onStyleChange: (style: RideStyle) => void;
  onThemeChange: (theme: RideTheme) => void;
}

export function RideLookBar(props: RideLookBarProps): ReactElement {
  const { style, theme, onStyleChange, onThemeChange } = props;
  return (
    <div data-testid="ride-look-bar" className="z-10 flex flex-col gap-2 bg-background py-2 lg:sticky lg:top-0">
      <fieldset className="min-w-0">
        <legend className="sr-only">Ride style</legend>
        <div className="flex flex-wrap gap-2">
          {RIDE_STYLES.map((option) => (
            <label key={option} title={RIDE_STYLE_DETAILS[option].description} className={CHOICE_PILL_CLASS}>
              <input
                type="radio"
                name="ride-style"
                checked={option === style}
                onChange={() => onStyleChange(option)}
                className="accent-accent"
              />
              {RIDE_STYLE_DETAILS[option].name}
            </label>
          ))}
        </div>
      </fieldset>
      <ThemePicker theme={theme} onThemeChange={onThemeChange} />
    </div>
  );
}
