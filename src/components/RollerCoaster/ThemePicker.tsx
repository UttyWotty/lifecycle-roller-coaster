/**
 * One-row strip for choosing how a ride looks, with a small preview of every theme.
 * It scrolls sideways rather than growing, so it stays beside the drawing it changes.
 * The choice belongs to the parent, so it survives moving between stages.
 */
"use client";

import type { ReactElement } from "react";
import { useT } from "@/components/I18n/useLocale";
import { ThemePreview } from "@/components/Scene/ThemePreview";
import type { MessageKey } from "@/lib/i18n/messages";
import { RIDE_THEME_GROUPS, RIDE_THEME_DETAILS, RIDE_THEMES, type RideTheme, type RideThemeGroup } from "@/lib/scene/themes";

interface ThemePickerProps {
  theme: RideTheme;
  onThemeChange: (theme: RideTheme) => void;
}

const CARD_CLASS =
  "flex w-36 shrink-0 flex-col gap-1 rounded-lg border border-muted p-1.5 text-xs font-semibold lg:w-24 lg:gap-0.5 lg:p-1 lg:text-[11px] has-checked:border-accent has-checked:outline-2 has-checked:outline-accent";

/** Each theme group's heading, in the visitor's language. */
const GROUP_NAMES: Readonly<Record<RideThemeGroup, MessageKey>> = {
  "Art modes": "look.groupArtModes",
  Worlds: "look.groupWorlds",
  Scenes: "look.groupScenes",
};

export function ThemePicker({ theme, onThemeChange }: ThemePickerProps): ReactElement {
  const t = useT();
  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">{t("look.themeLegend")}</legend>
      <div className="flex gap-4 overflow-x-auto pb-2 lg:gap-3">
        {RIDE_THEME_GROUPS.map((group) => (
          <div key={group} className="flex shrink-0 flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted lg:text-[10px]">{t(GROUP_NAMES[group])}</p>
            <div className="flex gap-2 p-0.5">
              {RIDE_THEMES.filter((option) => RIDE_THEME_DETAILS[option].group === group).map((option) => (
                <label key={option} title={t(`look.${option}Theme`)} className={CARD_CLASS}>
                  <ThemePreview theme={option} />
                  <span className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="ride-theme"
                      checked={option === theme}
                      onChange={() => onThemeChange(option)}
                      className="accent-accent"
                    />
                    <span className="truncate">{t(`look.${option}Theme`)}</span>
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
