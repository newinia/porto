
import type { Metadata } from "next";
import "./globals.css";
import VisitTracker from "./components/VisitTracker";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Newi — Portfolio",
  description:
    "Hi, I'm Newi! Software Engineering student exploring software development, data, and design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Suspense fallback={null}>
          <VisitTracker />
        </Suspense>
        {children}</body>
    </html>
  );
}
