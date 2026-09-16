import type { Metadata } from "next";
import "@/styles/globals.scss";

// ========================
// Metadata — shown in browser tab
// ========================

export const metadata: Metadata = {
  title: "Whodunit",
  description: "A noir detective mystery game",
};

// ========================
// Root Layout — wraps every page
// ========================

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
