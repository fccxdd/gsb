// components/LifeBar.tsx

"use client";

import { useEffect, useState, useRef } from "react";
import { GameConfig } from "@/lib/gameConfig";

interface LifeBarProps {
  lives: number;
}

const coinStyles: Record<number, { outer: string; inner: string }> = {
  3: {
    outer: GameConfig.puzzleBackgroundColors.gold,
    inner: GameConfig.puzzleBackgroundColors.inner_gold,
  },
  2: {
    outer: GameConfig.puzzleBackgroundColors.silver,
    inner: GameConfig.puzzleBackgroundColors.inner_silver,
  },
  1: {
    outer: GameConfig.puzzleBackgroundColors.bronze,
    inner: GameConfig.puzzleBackgroundColors.inner_bronze,
  },
  0: {
    outer: GameConfig.lostLifeColor.outer,
    inner: GameConfig.lostLifeColor.inner,
  },
};

export default function LifeBar({ lives }: LifeBarProps) {
  const [animating, setAnimating] = useState(false);
  const prevLivesRef = useRef(lives);

  useEffect(() => {
    if (lives < prevLivesRef.current) {
      setAnimating(true);
      const t = setTimeout(() => setAnimating(false), 600);
      prevLivesRef.current = lives;
      return () => clearTimeout(t);
    }
    prevLivesRef.current = lives;
  }, [lives]);

  const activeStyle = coinStyles[lives];

  return (
    <div className="flex gap-3 items-center justify-center mt-4">
      {Array.from({ length: GameConfig.maxLives }).map((_, i) => {
        const isFilled = i < lives;
        const isLost = i === lives && animating;
        const style = isFilled ? activeStyle : coinStyles[0];

        return (
          <div
            key={i}
            className={`
              w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center
              transition-all duration-500
              ${style.outer}
              ${isLost ? "scale-125 opacity-0" : "scale-100 opacity-100"}
            `}
          >
            <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full ${style.inner}`} />
          </div>
        );
      })}
    </div>
  );
}