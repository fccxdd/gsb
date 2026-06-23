// components/PuzzleGrid.tsx

"use client";

import Image from "next/image";
import { useEffect } from "react";
import { GameConfig } from "../lib/gameConfig";
import { useTileAnimation } from "@/hooks/useTileAnimation";
import type { Company } from "@/types";

const RANK_COLORS: Record<number, string> = {
  1: GameConfig.puzzleBackgroundColors.gold,
  2: GameConfig.puzzleBackgroundColors.silver,
  3: GameConfig.puzzleBackgroundColors.bronze,
  4: GameConfig.puzzleBackgroundColors.fourth,
};

interface PuzzleGridProps {
  companies: Company[];
  displayOrder: { id: number; src: string; alt: string; slot: number }[];
  orderedIds: number[];
  setOrderedIds: React.Dispatch<React.SetStateAction<number[]>>;
  incorrectIds: number[];
  snapIds: number[];
  pendingSnapIds: number[];
  snappingIds: number[];
  isSubmitting: boolean;
  revealedRanks: number[];
  resolvedSlots: Record<number, number>;
  clearStylesRef: React.MutableRefObject<((ids: number[]) => void) | null>;
  hasWon: boolean;
  gameOver: boolean;
}

export default function PuzzleGrid({
  companies,
  displayOrder,
  orderedIds,
  setOrderedIds,
  incorrectIds,
  snapIds,
  pendingSnapIds,
  snappingIds,
  isSubmitting,
  revealedRanks,
  resolvedSlots,
  clearStylesRef,
  hasWon,
  gameOver,
}: PuzzleGridProps) {
  const { tileRefs, clearStyles } = useTileAnimation(resolvedSlots, displayOrder);

  useEffect(() => {
    clearStylesRef.current = clearStyles;
  });

  const unlockedCount = 4 - snapIds.length;

  // Ranks still available for selection (those not yet snapped).
  const snappedRanks = new Set(snapIds.map((id) => companies.find((c) => c.id === id)!.correctRank));
  const availableRanks = ([1, 2, 3, 4] as const).filter((r) => !snappedRanks.has(r));

  function handleClick(id: number) {
    if (isSubmitting) return;
    const existingIndex = orderedIds.indexOf(id);

    if (existingIndex !== -1) {
      // Deselect — if it was the last auto-filled spot, also remove the auto-fill
      let next = orderedIds.filter((_, i) => i !== existingIndex);
      if (next.length === unlockedCount - 1 && orderedIds.length === unlockedCount) {
        next = next.slice(0, -1);
      }
      setOrderedIds(next);
    } else {
      if (orderedIds.length >= unlockedCount) return;
      const next = [...orderedIds, id];
      // Auto-fill the last slot with whichever tile wasn't picked
      if (next.length === unlockedCount - 1) {
        const lastId = displayOrder.find(
          (l) => !next.includes(l.id) && !snapIds.includes(l.id)
        )?.id;
        if (lastId !== undefined) next.push(lastId);
      }
      setOrderedIds(next);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-2xl p-2">
      {displayOrder.map((logo) => {
        const selectionRank = orderedIds.indexOf(logo.id);
        const isAutoFilled  = selectionRank === unlockedCount - 1;
        const isSnapped     = snapIds.includes(logo.id);
        const isPending     = pendingSnapIds.includes(logo.id);
        const isSnapping    = Object.keys(resolvedSlots).length > 0 && resolvedSlots[logo.id] !== undefined && snappingIds.includes(logo.id);
        const isDisplaced   = Object.keys(resolvedSlots).length > 0 && resolvedSlots[logo.id] !== undefined && !snappingIds.includes(logo.id);
        const isAnimating   = isSnapping || isDisplaced;
        const isIncorrect   = incorrectIds.includes(logo.id);
        const company       = companies.find((c) => c.id === logo.id)!;
        // Revenue only shows on the final win reveal, never mid-game.
        const isRevealed    = gameOver && isSnapped && revealedRanks.includes(company.correctRank);

        // Color priority: snapped/pending/snapping → correct rank color
        //                 displaced → stay white (don't reveal rank color during animation)
        //                 selected → rank color by slot position (gold=1st pick, silver=2nd, etc.)
        //                 default → white
        const bg =
          isSnapped || isPending || isSnapping
            ? RANK_COLORS[company.correctRank]
            : selectionRank !== -1 && !isAnimating
            ? RANK_COLORS[availableRanks[selectionRank]]
            : "bg-white";

        const isInteractive = !isAutoFilled && !isSubmitting && !isSnapped && !isPending && !isAnimating;

        return (
          <button
            key={logo.id}
            ref={(el) => { tileRefs.current[logo.id] = el; }}
            onClick={() => handleClick(logo.id)}
            disabled={!isInteractive}
            className={[
              "relative overflow-hidden rounded-2xl border border-zinc-200",
              "flex items-center justify-center",
              "w-[120px] h-[120px] sm:w-[200px] sm:h-[200px]",
              bg,
              isInteractive ? "cursor-pointer" : "cursor-default",
              isIncorrect ? "opacity-50 shake" : "opacity-100",
            ].join(" ")}
          >
            {/* Logo — slides up when revenue is revealed */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                style={{ transitionDuration: `${GameConfig.duration.revenueLogoSlide}ms` }}
                className={[
                  "flex items-center justify-center transition-transform ease-in-out",
                  "w-[80px] h-[80px] sm:w-[100px] sm:h-[100px]",
                  isRevealed ? "-translate-y-6 sm:-translate-y-8" : "translate-y-0",
                ].join(" ")}
              >
                <div className="relative w-full h-full">
                  <Image src={logo.src} alt={logo.alt} fill className="object-contain" />
                </div>
              </div>
            </div>

            {/* Revenue badge — fades in after reveal */}
            <div
              style={{
                transitionDuration: `${GameConfig.duration.revenueFadeIn}ms`,
                transitionDelay: isRevealed ? `${GameConfig.duration.revenueFadeDelay}ms` : "0ms",
              }}
              className={[
                "absolute bottom-4 sm:bottom-5 flex flex-col items-center gap-1",
                "transition-opacity ease-in-out",
                isRevealed ? "opacity-100" : "opacity-0",
              ].join(" ")}
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

            {/* Medal shine on win */}
            {hasWon && isSnapped && company.correctRank !== 4 && (
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