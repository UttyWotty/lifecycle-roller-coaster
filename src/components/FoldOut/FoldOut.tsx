/**
 * A section that starts folded away behind its name and opens in place when chosen, remembered on this device.
 * It is built on the browser's own details and summary elements, so keyboards and screen readers work without code.
 * The ride screen uses it to keep extras one tap away, so the ride itself is what people see first.
 */
"use client";

import type { ReactElement, ReactNode } from "react";
import type { DeviceChoice } from "@/components/RollerCoaster/deviceChoice";

interface FoldOutProps {
  label: string;
  /** Where this section's open or closed state is remembered (see foldOutChoices). */
  choice: DeviceChoice;
  children: ReactNode;
  /** Extra classes for the outer box, such as "w-full" when it should span the page. */
  className: string;
}

export const FOLD_OUT_SUMMARY_CLASS =
  "flex min-h-[42px] cursor-pointer list-none items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold [&::-webkit-details-marker]:hidden";

export function FoldOut({ label, choice, children, className }: FoldOutProps): ReactElement {
  const { isOn } = choice.useChoice();
  return (
    <details
      data-testid="fold-out"
      open={isOn}
      onToggle={(event) => choice.set(event.currentTarget.open)}
      className={`group rounded-3xl border border-muted open:pb-3 ${className}`}
    >
      <summary className={FOLD_OUT_SUMMARY_CLASS}>
        <span aria-hidden="true" className="inline-block transition-transform group-open:rotate-90 motion-reduce:transition-none">
          ›
        </span>
        {label}
      </summary>
      <div className="flex flex-col gap-3 px-3 pt-1">{children}</div>
    </details>
  );
}
