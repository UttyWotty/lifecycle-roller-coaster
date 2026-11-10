/**
 * Anonymous page-view counting with Vercel Web Analytics, on the live site only.
 * Every address is cut down to its origin and path before it is sent, so shared rides and queries never leave the browser.
 * It uses no cookies and sends no story, events or ride data, and renders nothing in previews, local runs or tests.
 */
"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import type { ReactElement } from "react";
import { countedUrl, shouldCountPageViews } from "@/lib/analytics/countedUrl";

/** Inlined at build time by Next.js; Vercel sets it to production, preview or development. */
const DEPLOYMENT_ENVIRONMENT = process.env.NEXT_PUBLIC_VERCEL_ENV;

function withoutPrivateParts(event: BeforeSendEvent): BeforeSendEvent | null {
  const url = countedUrl(event.url);
  return url === null ? null : { ...event, url };
}

export function SiteAnalytics(): ReactElement | null {
  return shouldCountPageViews(DEPLOYMENT_ENVIRONMENT) ? <Analytics beforeSend={withoutPrivateParts} /> : null;
}
