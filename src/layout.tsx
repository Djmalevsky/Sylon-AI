import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sylon AI — AI Appointment Setting Platform",
  description:
    "Sylon simplifies AI appointment setting for marketing agencies using GoHighLevel.",
};

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
