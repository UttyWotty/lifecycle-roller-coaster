/**
 * Root layout shared by every route in the application.
 * It sets the document and social preview metadata and loads the global stylesheet.
 * System fonts are used so that no font request leaves the browser.
 */
import type { Metadata } from "next";
import type { ReactElement } from "react";
import "./globals.css";

/** Vercel sets the production host; links in previews and local runs fall back to the local address. */
const PRODUCTION_HOST = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "";
const LOCAL_SITE_URL = "http://localhost:3000";
const SITE_URL = PRODUCTION_HOST === "" ? LOCAL_SITE_URL : `https://${PRODUCTION_HOST}`;
const SITE_NAME = "Lifecycle Roller Coaster";
const SITE_DESCRIPTION = "Turn your life story into a playful roller-coaster timeline.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  openGraph: { siteName: SITE_NAME, title: SITE_NAME, description: SITE_DESCRIPTION, type: "website" },
  twitter: { card: "summary_large_image", title: SITE_NAME, description: SITE_DESCRIPTION },
};

export default function RootLayout({ children }: LayoutProps<"/">): ReactElement {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
