/**
 * The Random ride button, which redraws the ride in a surprise style, theme and rider in one press.
 * The choice comes from the pure pickSurpriseLook, so the theme always changes and a blank theme is never picked.
 * A polite live region names the new look for screen readers, because the change is otherwise only visible.
 */
"use client";

import { useState, type ReactElement } from "react";
import { SECONDARY_BUTTON_CLASS } from "@/components/EventReview/fieldStyles";
import { useT } from "@/components/I18n/useLocale";
import { pickSurpriseLook, type RideLook } from "@/lib/scene/randomLook";
import { RIDERS } from "@/lib/scene/riders";
import { RIDE_THEMES } from "@/lib/scene/themes";
import { RIDE_STYLES } from "@/lib/track/types";

const SURPRISE_CHOICES = { styles: RIDE_STYLES, themes: RIDE_THEMES, riders: RIDERS };

interface RandomRideButtonProps {
  look: RideLook;
  onLookChange: (look: RideLook) => void;
}

export function RandomRideButton({ look, onLookChange }: RandomRideButtonProps): ReactElement {
  const t = useT();
  const [announced, setAnnounced] = useState<RideLook | null>(null);

  function surprise(): void {
    const next = pickSurpriseLook(look, SURPRISE_CHOICES, Math.random);
    onLookChange(next);
    setAnnounced(next);
  }

  return (
    <>
      <button type="button" onClick={surprise} title={t("ride.randomRideHint")} className={SECONDARY_BUTTON_CLASS}>
        {t("ride.randomRide")}
      </button>
      <span role="status" className="sr-only">
        {announced &&
          t("ride.randomRideAnnounce", {
            theme: t(`look.${announced.theme}Theme`),
            style: t(`look.${announced.style}Name`),
            rider: t(`look.${announced.rider}Rider`),
          })}
      </span>
    </>
  );
}
