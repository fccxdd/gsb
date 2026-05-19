// components/LifeBar.tsx

"use client";

import { useEffect, useState, useRef } from "react";
import { GameConfig } from "@/lib/gameConfig";

interface LifeBarProps {
  lives: number;
}

const lifeColors: Record<number, string> = {
  3: GameConfig.puzzleBackgroundColors.gold,        // gold
  2: GameConfig.puzzleBackgroundColors.silver,      // silver
  1: GameConfig.puzzleBackgroundColors.bronze,      // bronze
  0: GameConfig.lostLifeColor,                      // empty
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

  const activeColor = lifeColors[lives];

  return (
    <div className="flex gap-3 items-center justify-center mt-4">
      {Array.from({ length: GameConfig.maxLives }).map((_, i) => {
        const isFilled = i < lives;
        const isLost = i === lives && animating; // the one just lost

        return (
          <div
            key={i}
            className={`
              w-6 h-6 rounded-full transition-all duration-500
              ${isFilled ? activeColor : lifeColors[0]}
              ${isLost ? "scale-125 opacity-0" : "scale-100 opacity-100"}
            `}
          />
        );
      })}
    </div>
  );
}
