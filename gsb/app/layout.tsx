import type { Metadata } from "next";
import { Inria_Serif } from "next/font/google";
import "./globals.css";
import { GameConfig } from "../lib/gameConfig";

const inriaSerif = Inria_Serif({
  variable: "--font-inria-serif",
  subsets: ["latin"],
  weight: ["400", "700"]
});

export const metadata: Metadata = {
  title: GameConfig.titleName,
  description: GameConfig.description,
  openGraph: {
    title: GameConfig.titleName,
    description: GameConfig.description,
    url: GameConfig.url,
    siteName: "GSB",
    images: [
      {
        url: GameConfig.imageURL,
        width: 1200,
        height: 1200,
        alt: "GSB - Rank by Revenue",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: GameConfig.titleName,
    description: GameConfig.description,
    images: [GameConfig.imageURL],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inriaSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
