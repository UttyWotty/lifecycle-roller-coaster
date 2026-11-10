/**
 * Landing page that introduces the product to a new visitor.
 * It shows the core idea, an example ride and a link to the story editor.
 * The page is static and holds no user data.
 */
import type { ReactElement } from "react";
import { ExampleRide } from "@/components/Landing/ExampleRide";
import { LandingIntro } from "@/components/Landing/LandingIntro";
import { ThemeGallery } from "@/components/Landing/ThemeGallery";

export default function Home(): ReactElement {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-8 px-4 py-12 text-center">
      <LandingIntro />
      <ExampleRide />
      <ThemeGallery />
    </main>
  );
}
