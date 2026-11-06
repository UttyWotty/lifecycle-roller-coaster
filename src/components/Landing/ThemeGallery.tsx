/**
 * Strip of every theme on the landing page, so visitors see the range before they start.
 * Each one leads to a sample life, where the theme can be tried for free.
 * The strip is static and holds no user data.
 */
import Link from "next/link";
import type { ReactElement } from "react";
import { ThemePreview } from "@/components/Scene/ThemePreview";
import { RIDE_THEME_DETAILS, RIDE_THEMES } from "@/lib/scene/themes";

export function ThemeGallery(): ReactElement {
  return (
    <section aria-label="Themes" className="flex w-full flex-col gap-3">
      <h2 className="text-xl font-semibold">Pick a look for your ride</h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {RIDE_THEMES.map((theme) => (
          <li key={theme}>
            <Link href="/sample" className="flex flex-col gap-1 text-sm font-semibold">
              <ThemePreview theme={theme} />
              {RIDE_THEME_DETAILS[theme].name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
