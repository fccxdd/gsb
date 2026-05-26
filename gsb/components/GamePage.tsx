// components/GamePage.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { ImNewspaper } from "react-icons/im";
import { GameConfig } from "@/lib/gameConfig";
import PuzzleGrid from "@/components/PuzzleGrid";
import NewspaperModal from "@/components/NewsPaperModal";
import SplashScreen from "@/components/SplashScreen";
import LifeBar from "@/components/LifeBar";
import type { Puzzle } from "@/types";

const correctPositionByRank: Record<number, number> = {
  1: 0,
  2: 1,
  3: 2,
  4: 3,
};

const SPLASH_KEY = "gsb_splash_shown";

export default function GamePage({ puzzle }: { puzzle: Puzzle }) {

  // Show splash every time this component mounts — cleared on unmount so
  // back/forward navigation always gets a fresh splash.
  const [showSplash, setShowSplash] = useState(true);

  const [orderedIds, setOrderedIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [incorrectIds, setIncorrectIds] = useState<number[]>([]);
  const [correctIds, setCorrectIds] = useState<number[]>([]);
  const [snapIds, setSnapIds] = useState<number[]>([]);
  const [revealCorrect, setRevealCorrect] = useState(false);
  const [lockedPositions, setLockedPositions] = useState<Record<number, number>>({});
  const [newspaperOpen, setNewspaperOpen] = useState(false);
  const [revealedRanks, setRevealedRanks] = useState<number[]>([]);
  const [successOpen, setSuccessOpen] = useState(false);
  const [lives, setLives] = useState(GameConfig.maxLives);
  const [gameOver, setGameOver] = useState(false);

  const clearStylesRef = useRef<((ids: number[]) => void) | null>(null);
  const canSubmit = orderedIds.length === (4 - snapIds.length) && !isSubmitting && !gameOver;
  const canDeselect = orderedIds.length > 0 && !isSubmitting && !gameOver;

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

    const unlockedSlots = [0, 1, 2, 3].filter(
      (slot) => !Object.values(lockedPositions).includes(slot)
    );

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

    await new Promise((r) => setTimeout(r, GameConfig.duration.delayAfterSubmission));

    if (wrong.length === 0) {
      setGameOver(true);

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

      let currentSnapIds = snapIds;
      if (correct.length > 0) {
        const correctNonFourth = correct.filter((id) => {
          const company = puzzle.companies.find((c) => c.id === id)!;
          return company.correctRank !== 4;
        });

        if (correctNonFourth.length > 0) {
          setCorrectIds((prev) => [...prev, ...correctNonFourth]);
          await new Promise((r) => setTimeout(r, GameConfig.duration.tileSlide));

          clearStylesRef.current?.(correctNonFourth);

          const newLocked: Record<number, number> = {};
          correctNonFourth.forEach((id) => {
            const company = puzzle.companies.find((c) => c.id === id)!;
            newLocked[id] = correctPositionByRank[company.correctRank];
          });
          setLockedPositions((prev) => ({ ...prev, ...newLocked }));
          currentSnapIds = [...snapIds, ...correctNonFourth];
          setSnapIds(currentSnapIds);

          await new Promise((r) => setTimeout(r, GameConfig.duration.partialCorrectSettle));
          setRevealCorrect(true);
        }
      }

      setOrderedIds((prev) => prev.filter((id) => !wrong.includes(id) && !correct.includes(id)));

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

        <h2 className="text-xl font-semibold text-gray-700">
          Rank by revenue -{" "}
          <span className={GameConfig.puzzleTextColors.gold}>Gold</span>{" "}
          <span className={GameConfig.puzzleTextColors.silver}>Silver</span>{" "}
          <span className={GameConfig.puzzleTextColors.bronze}>Bronze</span>
        </h2>

        <h3>{puzzle.fiscalYear}</h3>
        <h4>{puzzle.revenueRange}</h4>

        <PuzzleGrid
          companies={puzzle.companies}
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
                ? "border-zinc-300 text-zinc-500 hover:bg-zinc-100 cursor-pointer"
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
                ? "border-zinc-300 text-black hover:bg-zinc-100 cursor-pointer"
                : "border-zinc-200 text-zinc-300 cursor-not-allowed"
            }`}
          >
            {GameConfig.submitText}
          </button>
        </div>

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
            <span className="text-4xl">🎉</span>
            <h2 className="text-2xl font-bold text-zinc-800">Great work!</h2>
            <p className="text-zinc-500 text-sm">You ranked all 4 correctly.</p>
            <button
              onClick={() => setSuccessOpen(false)}
              className="mt-2 px-6 py-2 rounded-full bg-zinc-800 text-white text-sm hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              Nice!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}