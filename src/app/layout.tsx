import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { CookieBanner } from "@/components/layout/CookieBanner";

export const metadata: Metadata = {
  title: "Conduc Rail - Gestion de chantiers ferroviaires",
  description: "Application de gestion de chantiers ferroviaires",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={GeistSans.variable}>
      <body className="font-sans antialiased">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
