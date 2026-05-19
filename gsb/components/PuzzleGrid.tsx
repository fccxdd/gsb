"use client";

import Image from "next/image";
import { useRef, useEffect } from "react";
import { GameConfig } from "../lib/gameConfig";
import { todaysPuzzle } from "@/lib/puzzleMetadata";

const logos = todaysPuzzle.companies.map((c) => ({
  id: c.id,
  src: c.logoSrc,
  alt: c.name,
}));

const correctPositionByRank: Record<number, number> = {
  1: 0,
  2: 1,
  3: 2,
  4: 3,
};

const rankColors: Record<number, string> = {
  1: GameConfig.puzzleBackgroundColors.gold,
  2: GameConfig.puzzleBackgroundColors.silver,
  3: GameConfig.puzzleBackgroundColors.bronze,
  4: GameConfig.puzzleBackgroundColors.fourth,
};

interface PuzzleGridProps {
  orderedIds: number[];
  setOrderedIds: React.Dispatch<React.SetStateAction<number[]>>;
  incorrectIds: number[];
  correctIds: number[];
  isSubmitting: boolean;
  revealCorrect: boolean;
  lockedPositions: Record<number, number>;
  revealedRanks: number[];
}

export default function PuzzleGrid({
  orderedIds,
  setOrderedIds,
  incorrectIds,
  correctIds,
  isSubmitting,
  revealCorrect,
  lockedPositions,
  revealedRanks,
}: PuzzleGridProps) {

  const tileRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const prevPositions = useRef<Record<number, DOMRect>>({});
  const lockedCount = correctIds.length;
  const nextAvailableRank = lockedCount + 1;
  
  // FLIP: record positions before re-render
  useEffect(() => {
    if (revealCorrect) {
      logos.forEach((logo) => {
        const el = tileRefs.current[logo.id];
        if (el) prevPositions.current[logo.id] = el.getBoundingClientRect();
      });
    }
  }, [revealCorrect]);

  // FLIP: after re-render, animate from old to new positions
  useEffect(() => {
    if (!revealCorrect) return;

    let delay = 0;

    logos.forEach((logo) => {
      const el = tileRefs.current[logo.id];
      const prev = prevPositions.current[logo.id];
      if (!el || !prev) return;

      if (correctIds.length > 0 && !correctIds.includes(logo.id)) return;

      const next = el.getBoundingClientRect();
      const dx = prev.left - next.left;
      const dy = prev.top - next.top;

      if (dx === 0 && dy === 0) return;

      const myDelay = delay;
      delay += 1200;

      el.style.transition = "none";
      el.style.transform = `translate(${dx}px, ${dy}px)`;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transition = `transform 1s cubic-bezier(0.4, 0, 0.2, 1) ${myDelay}ms`;
          el.style.transform = "translate(0, 0)";
        });
      });
    });
  }, [revealCorrect, correctIds]);

  const displayOrder = (() => {
    const result: typeof logos = new Array(4).fill(null);

    logos.forEach((logo) => {
      if (lockedPositions[logo.id] !== undefined) {
        result[lockedPositions[logo.id]] = logo;
      }
    });

    const unlocked = logos.filter((logo) => lockedPositions[logo.id] === undefined);
    let unlockedIndex = 0;
    for (let i = 0; i < 4; i++) {
      if (!result[i]) {
        result[i] = unlocked[unlockedIndex++];
      }
    }

    return result;
  })();

  function handleClick(id: number) {
    if (isSubmitting) return;
    const existingIndex = orderedIds.indexOf(id);

    if (existingIndex !== -1) {
      const next = orderedIds.filter((_, i) => i !== existingIndex);
      if (next.length === 3 && orderedIds.length === 4) next.pop();
      setOrderedIds(next);
    } else {
      if (orderedIds.length >= 4) return;
      const next = [...orderedIds, id];
      if (next.length === 3) {
        const lastId = logos.find((l) => !next.includes(l.id))!.id;
        next.push(lastId);
      }
      setOrderedIds(next);
    }
  }

  return (
    <div className="grid grid-cols-2 border border-zinc-200">
      {displayOrder.map((logo) => {
        const rank = orderedIds.indexOf(logo.id);
        const isAutoFourth = rank === 3;
        const isIncorrect = incorrectIds.includes(logo.id);
        const isLocked = correctIds.includes(logo.id);
        const company = todaysPuzzle.companies.find((c) => c.id === logo.id)!;
        const isRevealed = revealedRanks.includes(company.correctRank);
        
        // locked tiles always use correctRank color, others use player selection
        const bg = isLocked
          ? rankColors[company.correctRank]
          : rank !== -1
          ? rankColors[nextAvailableRank + rank]
          : "bg-white";

        return (
          <button
            key={logo.id}
            ref={(el) => { tileRefs.current[logo.id] = el; }}
            onClick={() => !isAutoFourth && !isLocked && handleClick(logo.id)}
            disabled={isAutoFourth || isSubmitting || isLocked}
            className={`
              relative overflow-hidden
              w-[160px] h-[160px] sm:w-[200px] sm:h-[200px]
              border border-zinc-200 flex items-center justify-center
              transition-colors duration-500
              ${bg}
              ${!isAutoFourth && !isSubmitting && !isLocked ? "cursor-pointer" : "cursor-default"}
              ${isIncorrect ? "opacity-50 shake" : "opacity-100"}
            `}
          >
            {/* inner logo box — slides left on reveal */}
            <div
              className={`
                absolute flex items-center justify-center
                w-[80px] h-[80px] sm:w-[100px] sm:h-[100px]
                transition-all duration-700 ease-in-out
                ${isRevealed ? "-translate-x-4 sm:-translate-x-8" : "translate-x-0"}
              `}
            >
              <div className="relative w-full h-full">
                <Image src={logo.src} alt={logo.alt} fill className="object-contain" />
              </div>
            </div>

            {/* revenue — fades in on the right */}
            <div
              className={`
                absolute right-2 sm:right-4 flex flex-col items-end
                transition-opacity duration-700 ease-in-out delay-300
                ${isRevealed ? "opacity-100" : "opacity-0"}
              `}
            >
              <span className="text-[10px] sm:text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                Revenue
              </span>
              <span className="text-sm sm:text-lg font-bold text-zinc-800">
                {company.revenue}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}