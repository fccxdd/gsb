// components/HomeClient.tsx

"use client";

import { useState } from "react";
import type { Puzzle } from "@/types";
import Loading from "@/components/loading";
import Landing from "@/components/Landing";
import GamePageWrapper from "@/components/GamePageWrapper";
import SplashScreenNoPuzzle from "@/components/SplashScreenNoPuzzle";

interface HomeClientProps {
  puzzle: Puzzle | null;
}

export default function HomeClient({ puzzle }: HomeClientProps) {
  const [showSplash, setShowSplash] = useState(true);
  const [started, setStarted] = useState(false);

  if (showSplash) {
    return <Loading onDone={() => setShowSplash(false)} />;
  }

  if (!started) {
    return <Landing onPlay={() => setStarted(true)} />;
  }

  return puzzle ? (
    <GamePageWrapper puzzle={puzzle} />
  ) : (
    <SplashScreenNoPuzzle />
  );
}