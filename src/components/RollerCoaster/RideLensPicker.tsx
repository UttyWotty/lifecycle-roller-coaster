/**
 * Picker for ride lenses: the whole life, or one part of life, decade or age range as a ride of its own.
 * An optional birth year unlocks the age lenses, and the field keeps whatever the user types until it is a real year.
 * It only reports choices; which lenses exist and what they show comes from the pure rideLenses module.
 */
"use client";

import { useState, type ReactElement } from "react";
import { CHOICE_PILL_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/EventReview/fieldStyles";
import { useT } from "@/components/I18n/useLocale";
import { WHOLE_LIFE, parseBirthYear, type LensOption } from "@/lib/lenses/rideLenses";

interface RideLensPickerProps {
  lenses: readonly LensOption[];
  /** The lens in use, already checked against the available ones. */
  activeId: string;
  birthYear: number | null;
  onLensChange: (lens: string) => void;
  onBirthYearChange: (birthYear: number | null) => void;
}


export function RideLensPicker(props: RideLensPickerProps): ReactElement {
  const { lenses, activeId, birthYear, onLensChange, onBirthYearChange } = props;
  const t = useT();
  const [yearText, setYearText] = useState(birthYear === null ? "" : String(birthYear));
  const wholeLife = t("ride.wholeLife");
  const birthYearHint = t("ride.birthYearHint");
  const options = [{ id: WHOLE_LIFE, name: wholeLife, title: wholeLife }, ...lenses];

  function changeYear(text: string): void {
    setYearText(text);
    onBirthYearChange(parseBirthYear(text, new Date().getFullYear()));
  }

  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:gap-4">
      <fieldset className="min-w-0">
        <legend className="mb-1 text-sm font-semibold">{t("ride.lensLegend")}</legend>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <label key={option.id} title={option.title} className={CHOICE_PILL_CLASS}>
              <input
                type="radio"
                name="ride-lens"
                checked={option.id === activeId}
                onChange={() => onLensChange(option.id)}
                className="accent-accent"
              />
              {option.name}
            </label>
          ))}
        </div>
      </fieldset>
      <label className={`${LABEL_CLASS} lg:w-40 lg:shrink-0`} title={birthYearHint}>
        {t("ride.bornIn")}
        <input
          type="text"
          inputMode="numeric"
          maxLength={4}
          placeholder="1990"
          value={yearText}
          onChange={(event) => changeYear(event.target.value)}
          aria-describedby="birth-year-hint"
          className={FIELD_CLASS}
        />
        <span id="birth-year-hint" className="sr-only">
          {birthYearHint}
        </span>
      </label>
    </div>
  );
}
