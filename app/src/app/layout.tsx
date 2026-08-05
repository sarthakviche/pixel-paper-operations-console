import type { Metadata } from "next";
import "./globals.css";
import { UserContextProvider } from "@/context/user-context";

export const metadata: Metadata = {
  title: {
    default: "Pixel & Paper | Operations Console",
    template: "%s | Pixel & Paper",
  },
  description:
    "Internal operations console for Pixel & Paper — manage clients, projects, and the per-line production workflow of every video.",
  robots: {
    index: false, // Internal tool — do not index
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <UserContextProvider>
          {children}
        </UserContextProvider>
      </body>
    </html>
  );
}
