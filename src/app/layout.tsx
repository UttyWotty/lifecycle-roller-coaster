/**
 * Root layout shared by every route in the application.
 * It sets the document metadata and loads the global stylesheet.
 * System fonts are used so that no font request leaves the browser.
 */
import type { Metadata } from "next";
import type { ReactElement } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lifecycle Roller Coaster",
  description: "Turn your life story into a playful roller-coaster timeline.",
};

export default function RootLayout({ children }: LayoutProps<"/">): ReactElement {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
