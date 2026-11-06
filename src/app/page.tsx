/**
 * Landing page that introduces the product to a new visitor.
 * It shows the core idea, an example ride and a link to the story editor.
 * The page is static and holds no user data.
 */
import Link from "next/link";
import type { ReactElement } from "react";
import { ExampleRide } from "@/components/Landing/ExampleRide";

export default function Home(): ReactElement {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-8 px-4 py-12 text-center">
      <header className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold sm:text-5xl">Lifecycle Roller Coaster</h1>
        <p className="text-xl">Your life is a journey. Let&apos;s see what the ride looks like.</p>
        <p className="text-muted">
          Write your story in your own words, and watch the highs and lows turn into a roller
          coaster. No account needed.
        </p>
      </header>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/story"
          className="inline-flex min-h-11 items-center rounded-full bg-accent px-8 py-3 text-lg font-semibold text-on-accent"
        >
          Start your ride
        </Link>
        <Link
          href="/sample"
          className="inline-flex min-h-11 items-center rounded-full border border-muted px-8 py-3 text-lg font-semibold"
        >
          Try a sample life
        </Link>
      </div>
      <ExampleRide />
    </main>
  );
}
