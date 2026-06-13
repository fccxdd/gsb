// components/GamePage.tsx

"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { ImNewspaper } from "react-icons/im";
import { GameConfig } from "@/lib/gameConfig";
import PuzzleGrid from "@/components/PuzzleGrid";
import NewspaperModal from "@/components/NewsPaperModal";
import SplashScreen from "@/components/SplashScreen";
import LifeBar from "@/components/LifeBar";
import ShareButton from "@/components/ShareButton";
import { saveGameState } from "@/lib/gameStorage";
import type { Puzzle } from "@/types";

const correctPositionByRank: Record<number, number> = {
  1: 0,
  2: 1,
  3: 2,
  4: 3,
};

function getInitialState(puzzleDate: string) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("gsb_game_state");
    if (!raw) return null;
    const state = JSON.parse(raw);
    if (state.date !== puzzleDate) return null;
    return state;
  } catch {
    return null;
  }
}

export default function GamePage({ puzzle }: { puzzle: Puzzle }) {

  const [showSplash, setShowSplash] = useState(true);

  const [orderedIds, setOrderedIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [incorrectIds, setIncorrectIds] = useState<number[]>([]);
  const [correctIds, setCorrectIds] = useState<number[]>(() => getInitialState(puzzle.date)?.correctIds ?? []);
  const [snapIds, setSnapIds] = useState<number[]>(() => getInitialState(puzzle.date)?.snapIds ?? []);
  const [revealCorrect, setRevealCorrect] = useState<boolean>(() => getInitialState(puzzle.date)?.revealCorrect ?? false);
  const [lockedPositions, setLockedPositions] = useState<Record<number, number>>(() => getInitialState(puzzle.date)?.lockedPositions ?? {});
  const [newspaperOpen, setNewspaperOpen] = useState(false);
  const [revealedRanks, setRevealedRanks] = useState<number[]>(() => getInitialState(puzzle.date)?.revealedRanks ?? []);
  const [successOpen, setSuccessOpen] = useState<boolean>(() => getInitialState(puzzle.date)?.hasWon ?? false);
  const [lives, setLives] = useState<number>(() => getInitialState(puzzle.date)?.lives ?? GameConfig.maxLives);
  const [gameOver, setGameOver] = useState<boolean>(() => getInitialState(puzzle.date)?.gameOver ?? false);
  const [hasWon, setHasWon] = useState<boolean>(() => getInitialState(puzzle.date)?.hasWon ?? false);

  const clearStylesRef = useRef<((ids: number[]) => void) | null>(null);
  const [resolvedSlots, setResolvedSlots] = useState<Record<number, number> | undefined>(undefined);

  // Compute displayOrder here so GamePage has access to it at submit time
  const logos = puzzle.companies.map((c) => ({
    id: c.id,
    src: c.logoSrc,
    alt: c.name,
  }));

  const displayOrder = useMemo(() => {
    const result: (typeof logos[0] | null)[] = new Array(4).fill(null);

    logos.forEach((logo) => {
      if (lockedPositions[logo.id] !== undefined) {
        result[lockedPositions[logo.id]] = logo;
      }
    });

    const unplaced = logos.filter((logo) => lockedPositions[logo.id] === undefined);
    let unplacedIndex = 0;
    for (let i = 0; i < 4; i++) {
      if (!result[i] && unplaced[unplacedIndex]) {
        result[i] = unplaced[unplacedIndex++];
      }
    }

    return result.filter((x): x is typeof logos[0] => x !== null);
  }, [lockedPositions, puzzle.companies]);

  const canSubmit = orderedIds.length === (4 - snapIds.length) && !isSubmitting && !gameOver;
  const canDeselect = orderedIds.length > 0 && !isSubmitting && !gameOver;

  useEffect(() => {
    if (!gameOver && snapIds.length === 0) return;
    saveGameState({
      date: puzzle.date,
      lives,
      gameOver,
      hasWon,
      snapIds,
      correctIds,
      lockedPositions,
      revealedRanks,
      revealCorrect,
    });
  }, [lives, gameOver, hasWon, snapIds, correctIds, lockedPositions, revealedRanks, revealCorrect]);

  function handleDeselect() {
    setOrderedIds([]);
    setIncorrectIds([]);
  }

  async function autoSolve(currentSnapIds: number[]) {
    setGameOver(true);

    const allIds = puzzle.companies.map((c) => c.id);
    const unsolvedIds = allIds.filter((id) => !currentSnapIds.includes(id));

    setCorrectIds((prev) => [...prev, ...unsolvedIds]);
    await new Promise((r) => setTimeout(r, GameConfig.duration.tileSlide));

    clearStylesRef.current?.(unsolvedIds);

    const newLocked: Record<number, number> = {};
    unsolvedIds.forEach((id) => {
      const company = puzzle.companies.find((c) => c.id === id)!;
      newLocked[id] = correctPositionByRank[company.correctRank];
    });
    setLockedPositions((prev) => ({ ...prev, ...newLocked }));
    setSnapIds((prev) => [...prev, ...unsolvedIds]);

    setRevealCorrect(true);

    for (const rank of [1, 2, 3, 4]) {
      await new Promise((r) => setTimeout(r, GameConfig.duration.revealPerRank));
      setRevealedRanks((prev) => [...prev, rank]);
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setIncorrectIds([]);

    const wrong: number[] = [];
    const correct: number[] = [];

    // Base unlocked slots on snapIds (permanently correct tiles), NOT lockedPositions.
    // lockedPositions now tracks ALL tiles' visual slots including wrong/stationary ones,
    // so using it here would make unlockedSlots empty after the first wrong round.
    const snapSlots = snapIds.map((id) => lockedPositions[id]).filter((s) => s !== undefined);
    const unlockedSlots = [0, 1, 2, 3].filter((slot) => !snapSlots.includes(slot));

    orderedIds.forEach((id, index) => {
      const company = puzzle.companies.find((c) => c.id === id)!;
      const expectedSlot = unlockedSlots[index];
      const correctSlot = correctPositionByRank[company.correctRank];
      if (correctSlot === expectedSlot) {
        correct.push(id);
      } else {
        wrong.push(id);
      }
    });

    // If every tile the user consciously selected (all but the auto-last) is correct,
    // the auto-last tile must also be in its only remaining slot — treat it as a win.
    // Without this, a non-rank-4 auto-last tile grades as wrong and blocks the win.
    const userPickedCount = unlockedSlots.length - 1;
    const userPickedCorrect = correct.filter((id) => orderedIds.indexOf(id) < userPickedCount).length;
    if (userPickedCorrect === userPickedCount && wrong.length === 1 && orderedIds.indexOf(wrong[0]) === userPickedCount) {
      correct.push(wrong[0]);
      wrong.length = 0;
    }

    await new Promise((r) => setTimeout(r, GameConfig.duration.delayAfterSubmission));

    if (wrong.length === 0) {
      setGameOver(true);
      setHasWon(true);

      setCorrectIds((prev) => [...prev, ...orderedIds]);
      await new Promise((r) => setTimeout(r, GameConfig.duration.tileSlide));

      clearStylesRef.current?.(orderedIds);

      const newLocked: Record<number, number> = {};
      orderedIds.forEach((id) => {
        const company = puzzle.companies.find((c) => c.id === id)!;
        newLocked[id] = correctPositionByRank[company.correctRank];
      });
      setLockedPositions((prev) => ({ ...prev, ...newLocked }));
      setSnapIds((prev) => [...prev, ...orderedIds]);

      setRevealCorrect(true);

      for (const rank of [1, 2, 3, 4]) {
        await new Promise((r) => setTimeout(r, GameConfig.duration.revealPerRank));
        setRevealedRanks((prev) => [...prev, rank]);
      }

      await new Promise((r) => setTimeout(r, GameConfig.duration.successModalDelay));
      setSuccessOpen(true);

    } else {

      const newLives = lives - 1;
      setLives(newLives);

      setIncorrectIds(wrong);
      await new Promise((r) => setTimeout(r, GameConfig.duration.shakeAnimation));
      setIncorrectIds([]);
      // Remove only wrong tiles from selection so they lose their rank color.
      // Correct tiles keep their color during the swap animation.
      setOrderedIds((prev) => prev.filter((id) => !wrong.includes(id)));

      let currentSnapIds = snapIds;
      if (correct.length > 0) {
        // Only ranks 1-3 snap permanently. Rank-4 correct mid-game is silent —
        // no snap, no color reveal — but it can still be displaced by a correct tile.
        const correctNonFourth = correct.filter((id) => {
          const company = puzzle.companies.find((c) => c.id === id)!;
          return company.correctRank !== 4;
        });

        if (correctNonFourth.length > 0) {
          // Compute the final virtual grid BEFORE triggering animation,
          // so useTileAnimation knows where every tile (including wrong ones) ends up.
          const preVirtualSlot: Record<number, number> = {};
          displayOrder.forEach((entry, slot) => {
            if (!snapIds.includes(entry.id)) preVirtualSlot[entry.id] = slot;
          });
          const correctSet2 = new Set(correctNonFourth);
          correctNonFourth.forEach((correctId) => {
            const company = puzzle.companies.find((c) => c.id === correctId)!;
            const targetSlot = correctPositionByRank[company.correctRank];
            const originSlot = preVirtualSlot[correctId];
            if (originSlot === targetSlot) return;
            const displacedEntry = Object.entries(preVirtualSlot).find(([, s]) => s === targetSlot);
            preVirtualSlot[correctId] = targetSlot;
            if (displacedEntry && !correctSet2.has(Number(displacedEntry[0]))) {
              preVirtualSlot[Number(displacedEntry[0])] = originSlot;
            }
          });
          setResolvedSlots(preVirtualSlot);

          // Trigger the slide animation for correct tiles
          setCorrectIds((prev) => [...prev, ...correctNonFourth]);
          await new Promise((r) => setTimeout(r, GameConfig.duration.tileSlide));
          // Clear styles for ALL tiles that moved (correct + displaced wrong tiles),
          // not just correctNonFourth — otherwise displaced tiles keep their CSS
          // transform and get double-translated when lockedPositions updates.
          const allMovedIds = Object.keys(preVirtualSlot)
            .map(Number)
            .filter((id) => {
              const currentSlot = displayOrder.findIndex((e) => e.id === id);
              return currentSlot !== -1 && preVirtualSlot[id] !== currentSlot;
            });
          clearStylesRef.current?.(allMovedIds);
          setResolvedSlots(undefined);
        }

        // Build newLocked in one pass so we never double-assign a slot.
        //
        // Strategy:
        //   - Start with a virtual grid mirroring the current screen (idToSlot).
        //   - Move each correct tile to its target slot in the virtual grid.
        //   - The tile evicted from that target slot goes to the correct tile's origin slot.
        //   - After all swaps, write every non-snapped tile's final virtual slot to newLocked.
        //
        // This handles any number of simultaneous correct tiles without collisions.

        // virtualSlot: where each tile ends up after all swaps
        const virtualSlot: Record<number, number> = {};
        displayOrder.forEach((entry, slot) => {
          if (!snapIds.includes(entry.id)) {
            virtualSlot[entry.id] = slot;
          }
        });

        if (correctNonFourth.length > 0) {
          const correctSet = new Set(correctNonFourth);

          correctNonFourth.forEach((correctId) => {
            const company = puzzle.companies.find((c) => c.id === correctId)!;
            const targetSlot = correctPositionByRank[company.correctRank];
            const originSlot = virtualSlot[correctId];

            if (originSlot === targetSlot) return; // already in right slot, no swap needed

            // Find who currently occupies the target slot in the virtual grid
            const displacedId = Object.entries(virtualSlot).find(
              ([, s]) => s === targetSlot
            )?.[0];

            // Move correct tile to its target
            virtualSlot[correctId] = targetSlot;

            // Move displaced tile to the origin slot (if it exists and isn't also correct)
            if (displacedId !== undefined && !correctSet.has(Number(displacedId))) {
              virtualSlot[Number(displacedId)] = originSlot;
            }
          });
        }

        // Write the final virtual positions to newLocked
        const newLocked: Record<number, number> = {};
        Object.entries(virtualSlot).forEach(([id, slot]) => {
          newLocked[Number(id)] = slot;
        });

        // Rebuild lockedPositions from scratch for non-snapped tiles.
        // Merging with prev risks stale slot values from earlier rounds
        // causing two tiles to share the same slot and one to disappear.
        const snapLocked: Record<number, number> = {};
        snapIds.forEach((id) => {
          if (lockedPositions[id] !== undefined) {
            snapLocked[id] = lockedPositions[id];
          }
        });
        setLockedPositions({ ...snapLocked, ...newLocked });

        if (correctNonFourth.length > 0) {
          currentSnapIds = [...snapIds, ...correctNonFourth];
          setSnapIds(currentSnapIds);
          // Now clear correct tiles from orderedIds too — they're snapped so
          // isLocked drives their color from here on.
          setOrderedIds([]);
          await new Promise((r) => setTimeout(r, GameConfig.duration.partialCorrectSettle));
          setRevealCorrect(true);
        }
      } else {
        // No correct tiles at all — still lock all tiles to current visual slots.
        const newLocked: Record<number, number> = {};
        displayOrder.forEach((entry, slot) => {
          if (!snapIds.includes(entry.id)) {
            newLocked[entry.id] = slot;
          }
        });
        // Rebuild from scratch same as above
        const snapLocked: Record<number, number> = {};
        snapIds.forEach((id) => {
          if (lockedPositions[id] !== undefined) {
            snapLocked[id] = lockedPositions[id];
          }
        });
        setLockedPositions({ ...snapLocked, ...newLocked });
      }

      if (newLives === 0) {
        await autoSolve(currentSnapIds);
        setIsSubmitting(false);
        return;
      }
    }

    setIsSubmitting(false);
  }

  return (
    <div className="flex flex-col min-h-screen items-center bg-white font-sans">
      {showSplash && (
        <SplashScreen onDone={() => setShowSplash(false)} />
      )}
      <main className="flex w-full max-w-3xl flex-col items-center pt-20 pb-10 bg-zinc-50 min-h-screen">

        <h1 className="text-6xl font-bold tracking-wide">
          <span className={GameConfig.puzzleTextColors.gold}>G</span>
          <span className={GameConfig.puzzleTextColors.silver}>S</span>
          <span className={GameConfig.puzzleTextColors.bronze}>B</span>
        </h1>

        <h2 className="text-xl font-semibold">
          Rank by revenue -{" "}
          <span className={GameConfig.puzzleTextColors.gold}>Gold</span>{" "}
          <span className={GameConfig.puzzleTextColors.silver}>Silver</span>{" "}
          <span className={GameConfig.puzzleTextColors.bronze}>Bronze</span>
        </h2>

        <h3 style={{ color: "#4C4CDB", fontWeight: "bold" }}>{puzzle.fiscalYear}</h3>

        <div
          className="px-4 py-1.5 rounded-full text-white text-sm font-semibold"
          style={{ backgroundColor: "#2F8F22" }}
        >
          {puzzle.revenueRange}
        </div>

        <PuzzleGrid
          companies={puzzle.companies}
          displayOrder={displayOrder}
          orderedIds={orderedIds}
          setOrderedIds={setOrderedIds}
          incorrectIds={incorrectIds}
          correctIds={correctIds}
          snapIds={snapIds}
          isSubmitting={isSubmitting}
          revealCorrect={revealCorrect}
          lockedPositions={lockedPositions}
          revealedRanks={revealedRanks}
          clearStylesRef={clearStylesRef}
          resolvedSlots={resolvedSlots}
          hasWon={hasWon}
        />

        <button
          onClick={() => setNewspaperOpen(true)}
          className="cursor-pointer hover:opacity-70 transition-opacity"
        >
          <ImNewspaper className={`text-6xl ${GameConfig.newsPaperTextColor}`} />
        </button>

        <LifeBar lives={lives} />

        <NewspaperModal
          isOpen={newspaperOpen}
          onClose={() => setNewspaperOpen(false)}
          companies={puzzle.companies}
        />

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleDeselect}
            disabled={!canDeselect}
            className={`px-4 py-1.5 rounded-full border text-sm transition-colors ${
              canDeselect
                ? "border-zinc-300 text-black font-bold hover:bg-zinc-100 cursor-pointer"
                : "border-zinc-200 text-zinc-300 cursor-not-allowed"
            }`}
          >
            {GameConfig.deselectAllText}
          </button>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`px-4 py-1.5 rounded-full border text-sm transition-colors ${
              canSubmit
                ? "border-zinc-300 text-white bg-[#4C4CDB] font-bold cursor-pointer"
                : "border-zinc-200 text-zinc-300 cursor-not-allowed"
            }`}
          >
            {GameConfig.submitText}
          </button>
        </div>

        {hasWon && !successOpen && (
          <div className="flex flex-col items-center gap-3 mt-6">
            <ShareButton
              puzzleNumber={puzzle.number}
              puzzleDate={puzzle.date}
              lives={lives}
              maxLives={GameConfig.maxLives}
            />
          </div>
        )}

        {gameOver && !hasWon && (
          <div className="flex flex-col items-center gap-3 mt-6">
            <p className="text-zinc-500 text-sm">Better luck next time!</p>
          </div>
        )}

      </main>

      {successOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setSuccessOpen(false)}
        >
          <div
            className="bg-white rounded-2xl px-10 py-8 flex flex-col items-center gap-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-zinc-800">Great work!</h2>
            <p className="text-zinc-500 text-sm">You ranked all 4 correctly.</p>

            <ShareButton
              puzzleNumber={puzzle.number}
              puzzleDate={puzzle.date}
              lives={lives}
              maxLives={GameConfig.maxLives}
            />
          </div>
        </div>
      )}
    </div>
  );
}