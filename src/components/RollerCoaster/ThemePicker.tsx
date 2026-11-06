/**
 * One-row strip for choosing how a ride looks, with a small preview of every theme.
 * It scrolls sideways rather than growing, so it stays beside the drawing it changes.
 * The choice belongs to the parent, so it survives moving between stages.
 */
"use client";

import type { ReactElement } from "react";
import { ThemePreview } from "@/components/Scene/ThemePreview";
import { RIDE_THEME_GROUPS, RIDE_THEME_DETAILS, RIDE_THEMES, type RideTheme } from "@/lib/scene/themes";

interface ThemePickerProps {
  theme: RideTheme;
  onThemeChange: (theme: RideTheme) => void;
}

const CARD_CLASS =
  "flex w-36 shrink-0 flex-col gap-1 rounded-lg border border-muted p-1.5 text-xs font-semibold has-checked:border-accent has-checked:outline-2 has-checked:outline-accent";

export function ThemePicker({ theme, onThemeChange }: ThemePickerProps): ReactElement {
  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">Theme</legend>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {RIDE_THEME_GROUPS.map((group) => (
          <div key={group} className="flex shrink-0 flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{group}</p>
            <div className="flex gap-2 p-0.5">
              {RIDE_THEMES.filter((option) => RIDE_THEME_DETAILS[option].group === group).map((option) => (
                <label key={option} className={CARD_CLASS}>
                  <ThemePreview theme={option} />
                  <span className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="ride-theme"
                      checked={option === theme}
                      onChange={() => onThemeChange(option)}
                      className="accent-accent"
                    />
                    <span className="truncate">{RIDE_THEME_DETAILS[option].name}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
