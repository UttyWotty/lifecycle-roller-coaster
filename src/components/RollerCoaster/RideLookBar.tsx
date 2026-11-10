/**
 * Compact bar for choosing a ride's style and theme, right above the drawing.
 * On wide screens it stays pinned while the page scrolls, as one short row, so it never hides much of the drawing.
 * Neither control changes the events, only how they are drawn.
 */
"use client";

import type { ReactElement } from "react";
import { CHOICE_PILL_CLASS } from "@/components/EventReview/fieldStyles";
import { useT } from "@/components/I18n/useLocale";
import type { RideTheme } from "@/lib/scene/themes";
import type { RideStyle } from "@/lib/track/types";
import { ThemePicker } from "./ThemePicker";

interface RideLookBarProps {
  style: RideStyle;
  /** The styles on offer, such as all of them, or those a guessing game can be played in. */
  styles: readonly RideStyle[];
  theme: RideTheme;
  onStyleChange: (style: RideStyle) => void;
  onThemeChange: (theme: RideTheme) => void;
}

/** On wide screens the style choices stack beside the theme strip and shrink, keeping the pinned bar short. */
const COMPACT_PILL_CLASS = `${CHOICE_PILL_CLASS} lg:min-h-0 lg:px-2.5 lg:py-0.5 lg:text-xs`;

export function RideLookBar(props: RideLookBarProps): ReactElement {
  const { style, styles, theme, onStyleChange, onThemeChange } = props;
  const t = useT();
  return (
    <div data-testid="ride-look-bar" className="z-10 flex flex-col gap-2 bg-background py-2 lg:sticky lg:top-0 lg:flex-row lg:items-end lg:gap-4">
      <fieldset className="min-w-0 lg:shrink-0">
        <legend className="sr-only">{t("look.styleLegend")}</legend>
        <div className="flex flex-wrap gap-2 lg:flex-col lg:flex-nowrap lg:gap-1 lg:pb-2">
          {styles.map((option) => (
            <label key={option} title={t(`look.${option}Description`)} className={COMPACT_PILL_CLASS}>
              <input
                type="radio"
                name="ride-style"
                checked={option === style}
                onChange={() => onStyleChange(option)}
                className="accent-accent"
              />
              {t(`look.${option}Name`)}
            </label>
          ))}
        </div>
      </fieldset>
      <ThemePicker theme={theme} onThemeChange={onThemeChange} />
    </div>
  );
}
