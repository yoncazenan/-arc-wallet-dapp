import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arc Finance",
  description: "Arc Network dApp - USDC Wallet & Payments",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}