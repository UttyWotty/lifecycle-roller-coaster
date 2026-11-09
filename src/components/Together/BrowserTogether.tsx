/**
 * Browser-only entry to Ride together.
 * Both rides live in the link's fragment, which only the browser can read, so the server renders nothing for them.
 * Loading it in the browser alone keeps the server render and the browser from disagreeing.
 */
"use client";

import dynamic from "next/dynamic";
import type { ReactElement } from "react";

const TogetherView = dynamic(() => import("./TogetherView").then(({ TogetherView: View }) => View), { ssr: false });

export function BrowserTogether(): ReactElement {
  return <TogetherView />;
}
