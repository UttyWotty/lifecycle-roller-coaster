/**
 * Today's date for a ride page, read once from the user's clock when the page opens.
 * Rides use it to tell stops that have happened from stops still to come.
 * Reading it once keeps the drawing steady while the page is open, even across midnight.
 */
"use client";

import { useState } from "react";
import { todayString } from "@/lib/track/futureStops";

/** Runs only in the browser (the ride pages render client-side), so it is the visitor's own date. */
export function useToday(): string {
  const [today] = useState(() => todayString(new Date()));
  return today;
}
