// components/PuzzleGrid.tsx
"use client";

import Image from "next/image";
import { useEffect } from "react";
import { GameConfig } from "../lib/gameConfig";
import { useTileAnimation } from "@/hooks/useTileAnimation";
import type { Company } from "@/types";

const rankColors: Record<number, string> = {
  1: GameConfig.puzzleBackgroundColors.gold,
  2: GameConfig.puzzleBackgroundColors.silver,
  3: GameConfig.puzzleBackgroundColors.bronze,
  4: GameConfig.puzzleBackgroundColors.fourth,
};

interface PuzzleGridProps {
  companies: Company[];
  orderedIds: number[];
  setOrderedIds: React.Dispatch<React.SetStateAction<number[]>>;
  incorrectIds: number[];
  correctIds: number[];
  snapIds: number[];
  isSubmitting: boolean;
  revealCorrect: boolean;
  lockedPositions: Record<number, number>;
  revealedRanks: number[];
  clearStylesRef: React.MutableRefObject<((ids: number[]) => void) | null>;
}

export default function PuzzleGrid({
  companies,
  orderedIds,
  setOrderedIds,
  incorrectIds,
  correctIds,
  snapIds,
  isSubmitting,
  lockedPositions,
  revealedRanks,
  clearStylesRef,
}: PuzzleGridProps) {

  const logos = companies.map((c) => ({
    id: c.id,
    src: c.logoSrc,
    alt: c.name,
  }));

  const displayOrder = (() => {
    const result: (typeof logos[0] | null)[] = new Array(4).fill(null);

    logos.forEach((logo) => {
      if (snapIds.includes(logo.id) && lockedPositions[logo.id] !== undefined) {
        result[lockedPositions[logo.id]] = logo;
      }
    });

    const unsnapped = logos.filter((logo) => !snapIds.includes(logo.id));
    let unsnappedIndex = 0;
    for (let i = 0; i < 4; i++) {
      if (!result[i] && unsnapped[unsnappedIndex]) {
        result[i] = unsnapped[unsnappedIndex++];
      }
    }

    return result as typeof logos;
  })();

  const { tileRefs, clearStyles } = useTileAnimation(correctIds, displayOrder, companies);

  useEffect(() => {
    clearStylesRef.current = clearStyles;
  });

  const unlockedCount = 4 - snapIds.length;

  const lockedRanks = snapIds.map(
    (id) => companies.find((c) => c.id === id)!.correctRank
  );
  const availableRanks = ([1, 2, 3, 4] as const).filter(
    (r) => !lockedRanks.includes(r)
  );

  function handleClick(id: number) {
    if (isSubmitting) return;
    const existingIndex = orderedIds.indexOf(id);

    if (existingIndex !== -1) {
      const next = orderedIds.filter((_, i) => i !== existingIndex);
      if (next.length === unlockedCount - 1 && orderedIds.length === unlockedCount) next.pop();
      setOrderedIds(next);
    } else {
      if (orderedIds.length >= unlockedCount) return;
      const next = [...orderedIds, id];
      if (next.length === unlockedCount - 1) {
        const lastId = logos.find(
          (l) => !next.includes(l.id) && !snapIds.includes(l.id) && !correctIds.includes(l.id)
        )!.id;
        next.push(lastId);
      }
      setOrderedIds(next);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-2xl p-2">
      {displayOrder.map((logo) => {
        const rank = orderedIds.indexOf(logo.id);
        const isAutoFourth = rank === unlockedCount - 1;
        const isIncorrect = incorrectIds.includes(logo.id);
        const isLocked = snapIds.includes(logo.id);
        const isAnimating = correctIds.includes(logo.id) && !snapIds.includes(logo.id);
        const company = companies.find((c) => c.id === logo.id)!;
        const isRevealed = revealedRanks.includes(company.correctRank);

        const bg = isLocked
          ? rankColors[company.correctRank]
          : rank !== -1
          ? rankColors[availableRanks[rank]]
          : "bg-white";

        return (
          <button
            key={logo.id}
            ref={(el) => { tileRefs.current[logo.id] = el; }}
            onClick={() => handleClick(logo.id)}
            disabled={isAutoFourth || isSubmitting || isLocked || isAnimating}
            className={`
              relative overflow-hidden
              w-[160px] h-[160px] sm:w-[200px] sm:h-[200px]
              rounded-2xl border border-zinc-200 flex items-center justify-center
              transition-colors duration-500
              ${bg}
              ${!isAutoFourth && !isSubmitting && !isLocked && !isAnimating ? "cursor-pointer" : "cursor-default"}
              ${isIncorrect ? "opacity-50 shake" : "opacity-100"}
            `}
          >
            <div
              style={{
                transitionDuration: `${GameConfig.duration.revenueLogoSlide}ms`,
              }}
              className={`
                absolute flex items-center justify-center
                w-[80px] h-[80px] sm:w-[100px] sm:h-[100px]
                transition-all ease-in-out
                ${isRevealed ? "-translate-x-4 sm:-translate-x-8" : "translate-x-0"}
              `}
            >
              <div className="relative w-full h-full">
                <Image src={logo.src} alt={logo.alt} fill className="object-contain" />
              </div>
            </div>

            <div
              style={{
                transitionDuration: `${GameConfig.duration.revenueFadeIn}ms`,
                transitionDelay: isRevealed ? `${GameConfig.duration.revenueFadeDelay}ms` : "0ms",
              }}
              className={`
                absolute right-2 sm:right-4 flex flex-col items-end
                transition-opacity ease-in-out
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