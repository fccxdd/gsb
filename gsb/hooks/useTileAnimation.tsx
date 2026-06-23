// hooks/useTileAnimation.tsx

import { useEffect, useRef } from "react";
import { GameConfig } from "@/lib/gameConfig";

const GAP = 16;

interface Move {
  id: number;
  dx: number;
  dy: number;
}

// Given a resolved slot map {id -> targetSlot} and the current displayOrder snapshot,
// compute the pixel translate for every tile that needs to move.
// Uses entry.slot (real grid position) rather than the array index.
function computeMoves(
  resolvedSlots: Record<number, number>,
  snapshot: { id: number; slot: number }[],
  tileSize: number,
): Move[] {
  const moves: Move[] = [];
  snapshot.forEach((entry) => {
    const currentSlot = entry.slot; // real grid slot, not array index
    const targetSlot = resolvedSlots[entry.id];
    if (targetSlot === undefined || targetSlot === currentSlot) return;
    moves.push({
      id: entry.id,
      dx: ((targetSlot % 2) - (currentSlot % 2)) * (tileSize + GAP),
      dy: (Math.floor(targetSlot / 2) - Math.floor(currentSlot / 2)) * (tileSize + GAP),
    });
  });
  return moves;
}

export function useTileAnimation(
  resolvedSlots: Record<number, number>,
  displayOrder: { id: number; slot: number }[],
) {
  const tileRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  // Track which resolvedSlots object we last animated to avoid re-running on unrelated renders.
  const lastAnimatedSlots = useRef<Record<number, number>>({});

  function clearStyles(ids: number[]) {
    ids.forEach((id) => {
      const el = tileRefs.current[id];
      if (el) el.style.cssText = "";
    });
  }

  useEffect(() => {
    // Only animate when resolvedSlots has actually changed to a new non-empty object.
    if (
      resolvedSlots === lastAnimatedSlots.current ||
      Object.keys(resolvedSlots).length === 0
    ) return;
    lastAnimatedSlots.current = resolvedSlots;

    const tileSize = Object.values(tileRefs.current).find(Boolean)?.getBoundingClientRect().width;
    if (!tileSize) return;

    const moves = computeMoves(resolvedSlots, displayOrder, tileSize);
    if (moves.length === 0) return;

    const duration = GameConfig.duration.tileSlide;
    const half = duration / 2;
    const easing = "cubic-bezier(0.4, 0, 0.2, 1)";

    // Diagonal crossing: two tiles swapping positions diagonally animate together
    // so neither passes through the other.
    const isCrossingDiagonal =
      moves.length === 2 &&
      moves.every((m) => m.dx !== 0 && m.dy !== 0) &&
      moves[0].dx === -moves[1].dx &&
      moves[0].dy === -moves[1].dy;

    if (isCrossingDiagonal) {
      moves.forEach((move, i) => {
        const el = tileRefs.current[move.id];
        if (!el) return;
        el.style.zIndex = i === 0 ? "10" : "5";
        el.style.transition = `transform ${duration}ms ${easing}`;
        el.style.transform = `translate(${move.dx}px, ${move.dy}px)`;
      });
      return;
    }

    // Standard: horizontal step first, then vertical.
    const horizontal = moves.filter((m) => m.dx !== 0);
    const vertical   = moves.filter((m) => m.dy !== 0);

    horizontal.forEach(({ id, dx }) => {
      const el = tileRefs.current[id];
      if (!el) return;
      el.style.transition = `transform ${half}ms ${easing}`;
      el.style.transform = `translate(${dx}px, 0px)`;
    });

    const t = setTimeout(() => {
      vertical.forEach(({ id, dy }) => {
        const el = tileRefs.current[id];
        if (!el) return;
        const existingDx = horizontal.find((m) => m.id === id)?.dx ?? 0;
        el.style.transition = `transform ${half}ms ${easing}`;
        el.style.transform = `translate(${existingDx}px, ${dy}px)`;
      });
    }, horizontal.length > 0 ? half : 0);

    return () => clearTimeout(t);
  }, [resolvedSlots]);

  return { tileRefs, clearStyles };
}