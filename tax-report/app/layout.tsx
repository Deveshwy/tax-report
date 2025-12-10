import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tax Strategy Report - Legacy Investing Show",
  description: "Get your personalized tax strategy report in minutes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}