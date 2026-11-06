/**
 * Shared class names and label text for the event review controls.
 * Keeping them together gives every field the same look and touch target.
 * This module holds constants and one label helper, with no behaviour of its own.
 */

export const FIELD_CLASS =
  "min-h-11 w-full min-w-0 rounded-lg border border-muted bg-background px-3 py-2 text-base font-normal";
export const LABEL_CLASS = "flex min-w-0 flex-col gap-1 text-sm font-semibold";
export const SECONDARY_BUTTON_CLASS =
  "min-h-11 rounded-full border border-muted px-4 py-2 text-sm disabled:opacity-40";
export const CHOICE_PILL_CLASS =
  "flex min-h-11 items-center gap-2 rounded-full border border-muted px-3 py-2 text-sm font-semibold has-checked:border-accent has-checked:outline-1 has-checked:outline-accent";
export const ERROR_CLASS = "text-sm font-normal text-accent";

export function toLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
