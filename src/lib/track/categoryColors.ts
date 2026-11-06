/**
 * Marker colours and labels for each event category.
 * The same colours are used on screen and in exported images, so they suit both light and dark backgrounds.
 * This module holds data only and has no behaviour.
 */
import type { EventCategory } from "@/lib/events/schema";

export const CATEGORY_COLORS: Readonly<Record<EventCategory, string>> = {
  education: "#2563eb",
  career: "#d97706",
  relationships: "#db2777",
  finance: "#059669",
  business: "#7c3aed",
  personal: "#0891b2",
  health: "#dc2626",
  other: "#6b7280",
};
