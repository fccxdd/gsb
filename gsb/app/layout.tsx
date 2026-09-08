import type { Metadata } from "next";
import { Inria_Serif, Luckiest_Guy, Gaegu, Lora } from "next/font/google";
import "./globals.css";
import { GameConfig } from "../lib/gameConfig";
import Footer from "@/components/Footer";
import Script from "next/script";

const inriaSerif = Inria_Serif({
  variable: "--font-inria-serif",
  subsets: ["latin"],
  weight: ["400", "700"]
});

const luckiestGuy = Luckiest_Guy({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-luckiest",
});

const gaegu = Gaegu({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-gaegu",
});

const lora = Lora({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-lora",
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
      className={`${inriaSerif.variable} ${luckiestGuy.variable} ${gaegu.variable} ${lora.variable} h-full antialiased`}
    >
      {/* Google Tag */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-DZW8753FYH"
        strategy="afterInteractive"
      />
      <Script id="google-tag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-DZW8753FYH');
        `}
      </Script>
      
      <body className="min-h-full flex flex-col">
        <div className="flex-1 flex flex-col">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
