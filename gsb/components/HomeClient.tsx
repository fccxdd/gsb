// components/HomeClient.tsx

"use client";

import { useState } from "react";
import type { Puzzle } from "@/types";
import Landing from "@/components/Landing";
import GamePageWrapper from "@/components/GamePageWrapper";
import SplashScreenNoPuzzle from "@/components/SplashScreenNoPuzzle";

interface HomeClientProps {
  puzzle: Puzzle | null;
}

export default function HomeClient({ puzzle }: HomeClientProps) {
  const [started, setStarted] = useState(false);
  if (!started) {
    return <Landing onPlay={() => setStarted(true)} />;
  }

  return puzzle ? (
    <GamePageWrapper puzzle={puzzle} />
  ) : (
    <SplashScreenNoPuzzle />
  );
}