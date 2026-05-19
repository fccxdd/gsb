"use client";

import { useState } from "react";
import { ImNewspaper } from "react-icons/im";
import { GameConfig } from "@/lib/gameConfig";
import PuzzleGrid from "@/components/PuzzleGrid";
import { todaysPuzzle } from "@/lib/puzzleMetadata";
import NewspaperModal from "@/components/NewsPaperModal";
import Loading from "@/components/loading";
import LifeBar from "@/components/LifeBar";

const correctPositionByRank: Record<number, number> = {
  1: 0,
  2: 1,
  3: 2,
  4: 3,
};

export default function Home() {
  const [orderedIds, setOrderedIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [incorrectIds, setIncorrectIds] = useState<number[]>([]);
  const [correctIds, setCorrectIds] = useState<number[]>([]);
  const [revealCorrect, setRevealCorrect] = useState(false);
  const [lockedPositions, setLockedPositions] = useState<Record<number, number>>({});
  const [newspaperOpen, setNewspaperOpen] = useState(false);
  const [revealedRanks, setRevealedRanks] = useState<number[]>([]);
  const [successOpen, setSuccessOpen] = useState(false);
	const [lives, setLives] = useState(GameConfig.maxLives);
	const [gameOver, setGameOver] = useState(false);

  const canSubmit = orderedIds.length === 4 && !isSubmitting && !gameOver;
  const canDeselect = orderedIds.length > 0 && !isSubmitting && !gameOver;

  function handleDeselect() {
    setOrderedIds([]);
    setIncorrectIds([]);
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setIncorrectIds([]);

    const wrong: number[] = [];
    const correct: number[] = [];

    orderedIds.forEach((id, index) => {
      const company = todaysPuzzle.companies.find((c) => c.id === id);
      if (company?.correctRank === index + 1) {
        correct.push(id);
      } else {
        wrong.push(id);
      }
    });

    await new Promise((r) => setTimeout(r, 800));

    if (wrong.length === 0) {

				// Game Over
				setGameOver(true);
			  // lock all 4 into their correct positions
  			const newLocked: Record<number, number> = {};
			orderedIds.forEach((id) => {
				const company = todaysPuzzle.companies.find((c) => c.id === id)!;
				newLocked[id] = correctPositionByRank[company.correctRank];
			});
  setLockedPositions(newLocked);
  setCorrectIds(orderedIds);
      setRevealCorrect(true);

      // shorter wait for swaps to finish
      await new Promise((r) => setTimeout(r, 800));

      // reveal each rank with shorter gap
      for (const rank of [1, 2, 3, 4]) {
        await new Promise((r) => setTimeout(r, 400));
        setRevealedRanks((prev) => [...prev, rank]);
      }

      // show success modal after all reveals
      await new Promise((r) => setTimeout(r, 600));
      setSuccessOpen(true);

    } else {
      
			// Lose a life for each incorrect guess
			setLives((prev) => prev - 1);
			
			// 1. shake incorrect
      setIncorrectIds(wrong);
      await new Promise((r) => setTimeout(r, 1200));
      setIncorrectIds([]);

      // 2. move correct tiles and lock their positions permanently
      if (correct.length > 0) {
        const newLocked: Record<number, number> = {};
        correct.forEach((id) => {
          const company = todaysPuzzle.companies.find((c) => c.id === id)!;
          newLocked[id] = correctPositionByRank[company.correctRank];
        });

        setLockedPositions((prev) => ({ ...prev, ...newLocked }));
        setCorrectIds((prev) => [...prev, ...correct]);
        setRevealCorrect(true);
        await new Promise((r) => setTimeout(r, correct.length * 1200 + 500));
      }

      // 3. only clear incorrect, keep correct locked in place
      setOrderedIds((prev) => prev.filter((id) => !wrong.includes(id)));
    }

    setIsSubmitting(false);
  }

  return (
    <div className="flex flex-col min-h-screen items-center bg-white font-sans">
      <Loading />
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

        <h3>{todaysPuzzle.year}</h3>
        <h4>{todaysPuzzle.revenueRange}</h4>

        <PuzzleGrid
          orderedIds={orderedIds}
          setOrderedIds={setOrderedIds}
          incorrectIds={incorrectIds}
          correctIds={correctIds}
          isSubmitting={isSubmitting}
          revealCorrect={revealCorrect}
          lockedPositions={lockedPositions}
          revealedRanks={revealedRanks}
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
          companies={todaysPuzzle.companies}
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

      {/* Success Modal */}
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