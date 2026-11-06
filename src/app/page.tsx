/**
 * Placeholder landing page for the application.
 * It shows the product name and core idea until roadmap phase 1 replaces it.
 * The page is static and holds no user data.
 */
import type { ReactElement } from "react";

export default function Home(): ReactElement {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-bold">Lifecycle Roller Coaster</h1>
      <p className="text-lg">Your life is a journey. Let&apos;s see what the ride looks like.</p>
    </main>
  );
}
