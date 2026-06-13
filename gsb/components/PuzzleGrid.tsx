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
  displayOrder: { id: number; src: string; alt: string }[];
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
  resolvedSlots?: Record<number, number>;
  hasWon: boolean;
}

export default function PuzzleGrid({
  companies,
  displayOrder,
  orderedIds,
  setOrderedIds,
  incorrectIds,
  correctIds,
  snapIds,
  isSubmitting,
  lockedPositions,
  revealedRanks,
  clearStylesRef,
  resolvedSlots,
  hasWon
}: PuzzleGridProps) {

  const logos = companies.map((c) => ({
    id: c.id,
    src: c.logoSrc,
    alt: c.name,
  }));

  const { tileRefs, clearStyles } = useTileAnimation(correctIds, displayOrder, companies, resolvedSlots);

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

        const bg = isLocked || isAnimating
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
              w-[120px] h-[120px] sm:w-[200px] sm:h-[200px]
              rounded-2xl border border-zinc-200 flex items-center justify-center
              transition-colors duration-500
              ${bg}
              ${!isAutoFourth && !isSubmitting && !isLocked && !isAnimating ? "cursor-pointer" : "cursor-default"}
              ${isIncorrect ? "opacity-50 shake" : "opacity-100"}
            `}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                style={{
                  transitionDuration: `${GameConfig.duration.revenueLogoSlide}ms`,
                }}
                className={`
                  flex items-center justify-center
                  w-[80px] h-[80px] sm:w-[100px] sm:h-[100px]
                  transition-transform ease-in-out
                  ${isRevealed ? "-translate-y-6 sm:-translate-y-8" : "translate-y-0"}
                `}
              >
                <div className="relative w-full h-full">
                  <Image src={logo.src} alt={logo.alt} fill className="object-contain" />
                </div>
              </div>
            </div>

            <div
              style={{
                transitionDuration: `${GameConfig.duration.revenueFadeIn}ms`,
                transitionDelay: isRevealed ? `${GameConfig.duration.revenueFadeDelay}ms` : "0ms",
              }}
              className={`
                absolute bottom-4 sm:bottom-5 flex flex-col items-center gap-1
                transition-opacity ease-in-out
                ${isRevealed ? "opacity-100" : "opacity-0"}
              `}
            >
              <span className="text-[10px] sm:text-xs font-semibold text-black uppercase tracking-wide">
                Revenue
              </span>
              <span
                className="px-3 py-1 rounded-full text-white text-xs sm:text-sm font-semibold"
                style={{ backgroundColor: "#2F8F22" }}
              >
                {company.revenue}
              </span>
            </div>

            {hasWon && isLocked && company.correctRank !== 4 && (
              <span
                className="medal-shine-overlay"
                style={{
                  animationDelay: `${
                    (company.correctRank - 1) * GameConfig.duration.revealPerRank +
                    GameConfig.duration.revenueFadeIn +
                    GameConfig.duration.revenueFadeDelay
                  }ms`,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}