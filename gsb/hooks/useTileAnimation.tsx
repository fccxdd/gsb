// hooks/useTileAnimation.tsx

import { useEffect, useRef } from "react";
import { GameConfig } from "@/lib/gameConfig";
import type { Company } from "@/types";

const correctPositionByRank: Record<number, number> = {
  1: 0,
  2: 1,
  3: 2,
  4: 3,
};

export function useTileAnimation(
  correctIds: number[],
  displayOrder: { id: number }[],
  companies: Company[],
  resolvedSlots?: Record<number, number>, // final slot for every non-snapped tile after swaps
) {
  const tileRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const animatedIds = useRef<Set<number>>(new Set());

  function clearStyles(ids: number[]) {
    ids.forEach((id) => {
      const el = tileRefs.current[id];
      if (!el) return;
      el.style.cssText = "";
    });
  }

  useEffect(() => {
    if (correctIds.length === 0) return;

    const newIds = correctIds.filter((id) => !animatedIds.current.has(id));
    if (newIds.length === 0) return;

    const tileSize = Object.values(tileRefs.current).find(Boolean)?.getBoundingClientRect().width;
    if (!tileSize) return;

    const snapshot = [...displayOrder];
    const halfSlide = GameConfig.duration.tileSlide / 2;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const GAP = 16;

    // Build the full set of moves using resolvedSlots if available,
    // otherwise fall back to the original single-correct-tile logic.
    let moves: { id: number; currentSlot: number; targetSlot: number; dx: number; dy: number }[] = [];

    if (resolvedSlots) {
      // resolvedSlots tells us exactly where every tile ends up.
      // Animate every tile that needs to move (correct tiles + any displaced wrong tiles).
      snapshot.forEach((entry, currentSlot) => {
        const targetSlot = resolvedSlots[entry.id];
        if (targetSlot === undefined || targetSlot === currentSlot) return;

        const colDiff = (targetSlot % 2) - (currentSlot % 2);
        const rowDiff = Math.floor(targetSlot / 2) - Math.floor(currentSlot / 2);

        moves.push({
          id: entry.id,
          currentSlot,
          targetSlot,
          dx: colDiff * (tileSize + GAP),
          dy: rowDiff * (tileSize + GAP),
        });
      });
    } else {
      // Original logic for win path (all correct at once)
      const correctMoves = companies
        .filter((c) => newIds.includes(c.id))
        .map((c) => {
          const currentSlot = snapshot.findIndex((l) => l.id === c.id);
          const targetSlot = correctPositionByRank[c.correctRank];
          if (currentSlot === -1 || currentSlot === targetSlot) return null;

          const colDiff = (targetSlot % 2) - (currentSlot % 2);
          const rowDiff = Math.floor(targetSlot / 2) - Math.floor(currentSlot / 2);

          return { id: c.id, currentSlot, targetSlot,
            dx: colDiff * (tileSize + GAP), dy: rowDiff * (tileSize + GAP) };
        })
        .filter(Boolean) as typeof moves;

      const correctIds_set = new Set(newIds);
      const displacedMoves = correctMoves
        .map((move) => {
          const displaced = snapshot[move.targetSlot];
          if (!displaced) return null;
          if (correctIds_set.has(displaced.id)) return null;

          const colDiff = (move.currentSlot % 2) - (move.targetSlot % 2);
          const rowDiff = Math.floor(move.currentSlot / 2) - Math.floor(move.targetSlot / 2);

          return { id: displaced.id, currentSlot: move.targetSlot, targetSlot: move.currentSlot,
            dx: colDiff * (tileSize + GAP), dy: rowDiff * (tileSize + GAP) };
        })
        .filter(Boolean) as typeof moves;

      moves = [...correctMoves, ...displacedMoves];
    }

    newIds.forEach((id) => animatedIds.current.add(id));

    if (moves.length === 0) return;

    const isCrossingDiagonal =
      moves.length === 2 &&
      moves.every((m) => m.dx !== 0 && m.dy !== 0) &&
      moves[0].dx === -moves[1].dx &&
      moves[0].dy === -moves[1].dy &&
      correctIds.length === companies.length;

    if (isCrossingDiagonal) {
      const [first, second] = moves;

      const el1 = tileRefs.current[first.id];
      if (el1) {
        el1.style.zIndex = "10";
        el1.style.transition = `transform ${GameConfig.duration.tileSlide}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        el1.style.transform = `translate(${first.dx}px, ${first.dy}px)`;
      }

      const el2 = tileRefs.current[second.id];
      if (el2) {
        el2.style.zIndex = "5";
        el2.style.transition = `transform ${GameConfig.duration.tileSlide}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        el2.style.transform = `translate(${second.dx}px, ${second.dy}px)`;
      }

    } else {
      const step1 = moves.filter((m) => m.dx !== 0);
      step1.forEach(({ id, dx }) => {
        const el = tileRefs.current[id];
        if (!el) return;
        el.style.transition = `transform ${halfSlide}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        el.style.transform = `translate(${dx}px, 0px)`;
      });

      const step2 = moves.filter((m) => m.dy !== 0);
      const t1 = setTimeout(() => {
        step2.forEach(({ id, dy }) => {
          const el = tileRefs.current[id];
          if (!el) return;
          const existingDx = step1.find((m) => m.id === id)?.dx ?? 0;
          el.style.transition = `transform ${halfSlide}ms cubic-bezier(0.4, 0, 0.2, 1)`;
          el.style.transform = `translate(${existingDx}px, ${dy}px)`;
        });
      }, step1.length > 0 ? halfSlide : 0);
      timeouts.push(t1);
    }

    return () => timeouts.forEach(clearTimeout);
  }, [correctIds]);

  return { tileRefs, clearStyles };
}