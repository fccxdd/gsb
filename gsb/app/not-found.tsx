// app/not-found.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GameConfig } from "@/lib/gameConfig";
import SplashScreenNoPuzzle from "@/components/SplashScreenNoPuzzle";
import { getNoPuzzleHeading } from "@/lib/noPuzzleHeading";

const PUZZLE_DATE_RE = /^\/puzzles\/(\d{4}-\d{2}-\d{2})$/;

// Cloudflare Pages serves this 404 page (with the browser's real URL
// intact) for any /puzzles/[date] path that wasn't pre-built, i.e. any
// date with no puzzle. This inspects that path to give a specific
// message instead of a generic "not found".
function getPuzzleDateHeading(pathname: string): string | null {
  const match = pathname.match(PUZZLE_DATE_RE);
  if (!match) return null;

  return getNoPuzzleHeading(match[1]);
}

export default function NotFound() {
  const pathname = usePathname();
  const puzzleHeading = getPuzzleDateHeading(pathname);

  if (puzzleHeading) {
    return <SplashScreenNoPuzzle heading={puzzleHeading} />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f4f4f4",
        gap: 24,
        padding: "0 24px",
        textAlign: "center",
      }}
    >
      <div style={{ position: "relative", width: 280, height: 280 }}>
        <Image
          src="/404-not-found.png"
          alt="404"
          fill
          style={{ objectFit: "contain" }}
        />
      </div>

      <p
        style={{
          fontSize: 30,
          fontWeight: 500,
          color: "#111",
          margin: 0,
        }}
      >
        It&apos;s not you, it&apos;s just a 404-Error
      </p>

      <Link
        href="/"
        style={{
          marginTop: 8,
          padding: "12px 28px",
          borderRadius: 12,
          backgroundColor: `${GameConfig.purpleColor}`,
          color: "#fff",
          fontSize: 20,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Back to GSB
      </Link>
    </div>
  );
}