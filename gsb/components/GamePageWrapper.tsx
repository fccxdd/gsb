// components/GamePageWrapper.tsx
"use client";

import { useState, useEffect } from "react";
import GamePage from "@/components/GamePage";
import type { Puzzle } from "@/types";

export default function GamePageWrapper({ puzzle }: { puzzle: Puzzle }) {
  const [splashKey, setSplashKey] = useState(0);

  useEffect(() => {
    const bump = () => setSplashKey((k) => k + 1);

    // Production: bfcache restore (WebSocket blocks this in dev)
    const onPageShow = (e: PageTransitionEvent) => { if (e.persisted) bump(); };

    // Dev fallback: bfcache is blocked by Next.js HMR WebSocket,
    // so popstate fires instead when hitting back/forward
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("popstate", bump);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("popstate", bump);
    };
  }, []);

  return <GamePage key={splashKey} puzzle={puzzle} />;
}