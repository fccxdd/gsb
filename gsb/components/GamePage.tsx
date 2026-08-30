// components/GamePage.tsx

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { GameConfig } from "@/lib/gameConfig";
import PuzzleGrid from "@/components/PuzzleGrid";
import NewspaperModal from "@/components/NewsPaperModal";
import SplashScreen from "@/components/SplashScreen";
import LifeBar from "@/components/LifeBar";
import ShareButton from "@/components/ShareButton";
import GameOverModal from "@/components/GameOverModal";
import { saveGameState, loadGameState } from "@/lib/gameStorage";
import type { Puzzle } from "@/types";
import TitleCoins, {TITLE_COINS_STYLES} from "@/components/TitleCoins";

// ── Constants ────────────────────────────────────────────────────────────────

const RANK_TO_SLOT: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3 };

function wait(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function loadSavedState(puzzleDate: string) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("gsb_game_state");
    if (!raw) return null;
    const state = JSON.parse(raw);
    return state.date === puzzleDate ? state : null;
  } catch {
    return null;
  }
}

// Given the current visual positions of non-snapped tiles and a list of
// correct tiles (ranks 1-3 only), work out the final slot for every tile.
// Correct tiles claim their exact target slot; whoever's left fills the gaps
// in their current visual order so bystanders shift as little as possible.
function resolveSwaps(
  visualSlots: Record<number, number>, // {id -> currentSlot} for non-snapped tiles
  correctIds: number[],                // ids of correct non-rank-4 tiles moving home this round
  rankToSlot: Record<number, number>,  // correctRank -> target slot
  getCompany: (id: number) => { correctRank: number },
): Record<number, number> {
  const correctSet = new Set(correctIds);

  // Correct tiles go straight to their rank's slot.
  const result: Record<number, number> = {};
  const claimedSlots = new Set<number>();
  correctIds.forEach((id) => {
    const target = rankToSlot[getCompany(id).correctRank];
    result[id] = target;
    claimedSlots.add(target);
  });

  // Everyone else fills the leftover slots, keeping their current visual order.
  const leftoverIds = Object.keys(visualSlots)
    .map(Number)
    .filter((id) => !correctSet.has(id))
    .sort((a, b) => visualSlots[a] - visualSlots[b]);

  // Only the slots the non-snapped pool actually occupies are up for grabs.
  const poolSlots = new Set(Object.values(visualSlots));
  const availableForLeftovers = [0, 1, 2, 3]
    .filter((s) => poolSlots.has(s) && !claimedSlots.has(s))
    .sort((a, b) => a - b);

  leftoverIds.forEach((id, i) => {
    result[id] = availableForLeftovers[i];
  });

  return result;
}

// Build a {id -> currentSlot} map for all non-snapped tiles.
// Uses entry.slot (the real grid slot) rather than the array index,
// so it's correct even if displayOrder is missing tiles.
function buildVisualSlots(
  displayOrder: { id: number; slot: number }[],
  snapIds: number[],
): Record<number, number> {
  const slots: Record<number, number> = {};
  displayOrder.forEach((entry) => {
    if (!snapIds.includes(entry.id)) slots[entry.id] = entry.slot;
  });
  return slots;
}

// Pin any tile that doesn't already have a saved position to wherever it's
// currently sitting, so nothing gets left without a slot and mis-placed next round.
function lockRemaining(
  base: Record<number, number>,
  displayOrder: { id: number; slot: number }[],
): Record<number, number> {
  const next = { ...base };
  displayOrder.forEach((entry) => {
    if (next[entry.id] === undefined) next[entry.id] = entry.slot;
  });
  return next;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function GamePage({ puzzle }: { puzzle: Puzzle }) {
  
  const saved = useMemo(() => {
  if (typeof window === "undefined") return null;
  return loadGameState(puzzle.date);
}, [puzzle.date]);

  const [showSplash,    setShowSplash]    = useState(true);
  const [orderedIds,    setOrderedIds]    = useState<number[]>([]);
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [incorrectIds,  setIncorrectIds]  = useState<number[]>([]);
  const [snapIds,       setSnapIds]       = useState<number[]>(() => saved?.snapIds       ?? []);
  const [visualPos,     setVisualPos]     = useState<Record<number, number>>(() => saved?.lockedPositions ?? {});
  const [revealedRanks, setRevealedRanks] = useState<number[]>(() => saved?.revealedRanks ?? []);
  const [lives,         setLives]         = useState<number>(() => saved?.lives           ?? GameConfig.maxLives);
  const [gameOver,      setGameOver]      = useState<boolean>(() => saved?.gameOver       ?? false);
  const [hasWon,        setHasWon]        = useState<boolean>(() => saved?.hasWon         ?? false);
  const [successOpen,   setSuccessOpen]   = useState<boolean>(() => saved?.hasWon         ?? false);
  const [lossOpen,      setLossOpen]      = useState<boolean>(() => (saved?.gameOver && !saved?.hasWon) ?? false);
  const [newspaperOpen, setNewspaperOpen] = useState(false);
  
  // resolvedSlots drives both the animation and the post-animation state update.
  // It's set before the animation starts and cleared after styles are wiped.
  const [resolvedSlots,  setResolvedSlots]  = useState<Record<number, number>>({});
  
  // Tiles that have finished animating but aren't officially snapped yet.
  // Keeps them colored correctly during the partialCorrectSettle delay.
  const [pendingSnapIds, setPendingSnapIds] = useState<number[]>([]);
  
  // Tiles actively animating TO their correct slot (gets rank color during animation).
  // Displaced bystander tiles are in resolvedSlots but NOT here, so they stay white.
  const [snappingIds,    setSnappingIds]    = useState<number[]>([]);

  const clearStylesRef = useRef<((ids: number[]) => void) | null>(null);

  const logos = useMemo(
    () => puzzle.companies.map((c) => ({ id: c.id, src: c.logoSrc, alt: c.name })),
    [puzzle.companies],
  );

  // displayOrder: tiles with a visualPos are pinned to their grid slot;
  // the rest fill in left-to-right. Each entry carries its real grid `slot`
  // so callers never need to use the array index as a proxy for position.
  const displayOrder = useMemo(() => {
    const grid: ({ id: number; src: string; alt: string; slot: number } | null)[] =
      [null, null, null, null];

    logos.forEach((logo) => {
      if (visualPos[logo.id] !== undefined) {
        grid[visualPos[logo.id]] = { ...logo, slot: visualPos[logo.id] };
      }
    });

    const unplaced = logos.filter((l) => visualPos[l.id] === undefined);
    let ui = 0;
    grid.forEach((_, i) => {
      if (!grid[i] && unplaced[ui]) {
        grid[i] = { ...unplaced[ui++], slot: i };
      }
    });

    return grid.filter((x): x is NonNullable<typeof grid[0]> => x !== null);
  }, [visualPos, logos]);

  const canSubmit   = orderedIds.length === 4 - snapIds.length && !isSubmitting && !gameOver;
  const canDeselect = orderedIds.length > 0 && !isSubmitting && !gameOver;

  // Persist state whenever meaningful fields change.
  useEffect(() => {
    if (!gameOver && snapIds.length === 0) return;
    saveGameState({
      date: puzzle.date,
      lives,
      gameOver,
      hasWon,
      snapIds,
      correctIds: snapIds,
      lockedPositions: visualPos,
      revealedRanks,
      revealCorrect: revealedRanks.length > 0,
    });
  }, [lives, gameOver, hasWon, snapIds, visualPos, revealedRanks]);

  const getCompany = useCallback(
    (id: number) => puzzle.companies.find((c) => c.id === id)!,
    [puzzle.companies],
  );

  // Reveal ranks one by one with a stagger.
  async function revealRanks() {
    for (const rank of [1, 2, 3, 4]) {
      await wait(GameConfig.duration.revealPerRank);
      setRevealedRanks((prev) => prev.includes(rank) ? prev : [...prev, rank]);
    }
  }

  // Animate tiles to their resolved positions, then clean up CSS transforms.
  // correctIds: the tiles actually snapping into place (get rank color during animation).
  // Displaced bystanders are in `resolved` but not in correctIds — they stay white.
  async function animateAndSettle(resolved: Record<number, number>, correctIds: number[]) {
    setSnappingIds(correctIds);
    setResolvedSlots(resolved);
    await wait(GameConfig.duration.tileSlide);
    const movedIds = displayOrder
      .filter((e) => resolved[e.id] !== undefined && resolved[e.id] !== e.slot)
      .map((e) => e.id);
    clearStylesRef.current?.(movedIds);
    setResolvedSlots({});
    setSnappingIds([]);
  }

  function handleDeselect() {
    setOrderedIds([]);
    setIncorrectIds([]);
  }

  // Used when the player loses — solve the board automatically.
  async function autoSolve(currentSnapIds: number[]) {
    const unsolvedIds = puzzle.companies
      .map((c) => c.id)
      .filter((id) => !currentSnapIds.includes(id));

    const currentVisual = buildVisualSlots(displayOrder, currentSnapIds);
    const resolved = resolveSwaps(currentVisual, unsolvedIds, RANK_TO_SLOT, getCompany);

    setGameOver(true);
    setRevealedRanks([]);
    await animateAndSettle(resolved, unsolvedIds);

    const finalPos = lockRemaining({ ...visualPos }, displayOrder);
    unsolvedIds.forEach((id) => { finalPos[id] = RANK_TO_SLOT[getCompany(id).correctRank]; });
    setVisualPos(finalPos);
    setSnapIds(puzzle.companies.map((c) => c.id));
    await revealRanks();
    setLossOpen(true);
  }

  // Grade the current selection. Returns the wrong/correct id lists, accounting
  // for the auto-filled last tile (if every real pick is right, it must be too).
  function gradeGuess(): { wrong: number[]; correct: number[] } {
    const snapSlots = new Set(snapIds.map((id) => visualPos[id]).filter((s) => s !== undefined));
    const unlockedSlots = [0, 1, 2, 3].filter((s) => !snapSlots.has(s));

    const wrong: number[] = [];
    const correct: number[] = [];
    orderedIds.forEach((id, i) => {
      const actual = RANK_TO_SLOT[getCompany(id).correctRank];
      if (actual === unlockedSlots[i]) correct.push(id);
      else wrong.push(id);
    });

    const pickedCount = unlockedSlots.length - 1;
    const pickedCorrect = correct.filter((id) => orderedIds.indexOf(id) < pickedCount).length;
    if (pickedCorrect === pickedCount && wrong.length === 1 && orderedIds.indexOf(wrong[0]) === pickedCount) {
      correct.push(wrong.pop()!);
    }

    return { wrong, correct };
  }

  // Full win sequence: settle the tiles, lock positions, reveal ranks, open modal.
  async function runWin() {
    setGameOver(true);
    setHasWon(true);
    // Wipe any mid-game reveals the moment we win, otherwise a tile can flash
    // its revenue for a frame before the proper reveal animation runs.
    setRevealedRanks([]);

    const resolved = resolveSwaps(buildVisualSlots(displayOrder, snapIds), orderedIds, RANK_TO_SLOT, getCompany);
    await animateAndSettle(resolved, orderedIds);

    const finalPos: Record<number, number> = { ...visualPos };
    orderedIds.forEach((id) => { finalPos[id] = RANK_TO_SLOT[getCompany(id).correctRank]; });
    setVisualPos(finalPos);
    setSnapIds(puzzle.companies.map((c) => c.id));

    await revealRanks();
    await wait(GameConfig.duration.successModalDelay);
    setSuccessOpen(true);
  }

  // Wrong guess: shake the bad tiles, snap any partial-correct ones into place,
  // and pin the rest. Returns who's snapped afterwards so the caller can check
  // for a loss.
  async function runWrongGuess(wrong: number[], correct: number[]): Promise<number[]> {
    setIncorrectIds(wrong);
    await wait(GameConfig.duration.shakeAnimation);
    setIncorrectIds([]);
    setOrderedIds((prev) => prev.filter((id) => !wrong.includes(id)));

    // A correct 4th-place tile doesn't snap or reveal mid-game, but it can still
    // get shoved around if another tile needs its slot.
    const correctNonFourth = correct.filter((id) => getCompany(id).correctRank !== 4);

    // Keep the already-snapped tiles where they are.
    const carried: Record<number, number> = {};
    snapIds.forEach((id) => {
      if (visualPos[id] !== undefined) carried[id] = visualPos[id];
    });

    // Nothing to snap — just pin the loose tiles and report no change.
    if (correctNonFourth.length === 0) {
      setVisualPos(lockRemaining(carried, displayOrder));
      return snapIds;
    }

    const resolved = resolveSwaps(buildVisualSlots(displayOrder, snapIds), correctNonFourth, RANK_TO_SLOT, getCompany);

    setPendingSnapIds(correctNonFourth);
    // Slide the tiles home first, then bring in the rank colors.
    await animateAndSettle(resolved, correctNonFourth);

    // Hold the color through the settle delay, but don't snap yet — snapping
    // early makes the color pop in too soon.
    
    const finalSnapIds = [...snapIds, ...correctNonFourth];
    setVisualPos(lockRemaining({ ...carried, ...resolved }, displayOrder));
    setOrderedIds([]);

    await wait(GameConfig.duration.partialCorrectSettle);

    // Now snap and reveal together. Snapping any earlier paints the rank
    // background before the reveal animation gets to play.
    setPendingSnapIds([]);
    setSnapIds(finalSnapIds);
    correctNonFourth.forEach((id) => {
      const rank = getCompany(id).correctRank;
      setRevealedRanks((prev) => prev.includes(rank) ? prev : [...prev, rank]);
    });

    return finalSnapIds;
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setIncorrectIds([]);

    const { wrong, correct } = gradeGuess();
    await wait(GameConfig.duration.delayAfterSubmission);

    if (wrong.length === 0) {
      await runWin();
      setIsSubmitting(false);
      return;
    }

    // Work out lives here rather than reading `lives` later — the state setter
    // won't have updated it yet by the time we need the new value.
    const newLives = lives - 1;
    setLives(newLives);

    const finalSnapIds = await runWrongGuess(wrong, correct);

    if (newLives === 0) await autoSolve(finalSnapIds);
    setIsSubmitting(false);
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className={`relative flex flex-col min-h-screen items-center font-sans ${GameConfig.pageBackgroundColor}`}>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}

      <main className="relative flex w-full max-w-3xl flex-col items-center pt-20 pb-10 min-h-screen">
        <div className="flex mt-2">
          <TitleCoins coins={TITLE_COINS_STYLES} />
        </div>

        <h2 className="text-xl md:text-2xl mt-3 tracking-wide font-bold">
          Rank by revenue -{" "}
          <span className={GameConfig.puzzleTextColors.gold}>Gold</span>{" "}
          <span className={GameConfig.puzzleTextColors.silver}>Silver</span>{" "}
          <span className={GameConfig.puzzleTextColors.bronze}>Bronze</span>
        </h2>

        <p className="text-2xl md:text-3xl font-bold" style={{ color: GameConfig.purpleColor }}>
          {puzzle.fiscalYear}
        </p>

        <p className="text-lg md:text-xl font-bold italic">
          {puzzle.revenueRange}
        </p>

        <PuzzleGrid
          companies={puzzle.companies}
          displayOrder={displayOrder}
          orderedIds={orderedIds}
          setOrderedIds={setOrderedIds}
          incorrectIds={incorrectIds}
          snapIds={snapIds}
          pendingSnapIds={pendingSnapIds}
          snappingIds={snappingIds}
          isSubmitting={isSubmitting}
          revealedRanks={revealedRanks}
          resolvedSlots={resolvedSlots}
          clearStylesRef={clearStylesRef}
          hasWon={hasWon}
          gameOver={gameOver}
        />

        <div className="w-full flex justify-center">
          <button
            onClick={() => setNewspaperOpen(true)}
            className="relative flex items-start gap-2 cursor-pointer hover:opacity-70 transition-opacity"
          >
            {/* Newsboy illustration */}
            <Image
              src="/newsboy.png"
              alt="Open newspaper"
              width={84}
              height={84}
            />

            {/* Speech bubble */}
            <div className="relative bg-white border-2 border-zinc-800 rounded-2xl px-4 py-2 mt-2">
              <div className="absolute -left-2 top-3 w-0 h-0
                              border-t-8 border-t-transparent
                              border-b-8 border-b-transparent
                              border-r-10 border-r-zinc-800" />
              <div className="absolute -left-1.5 top-3 w-0 h-0
                              border-t-7 border-t-transparent
                              border-b-7 border-b-transparent
                              border-r-9 border-r-white" />

              <span className="font-gaegu text-lg sm:text-xl text-zinc-800 leading-tight whitespace-nowrap">
                Read the<br /> Headlines
              </span>
            </div>
          </button>
        </div>

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
                ? "border-zinc-300 text-white font-bold cursor-pointer"
                : "border-zinc-200 text-zinc-300 cursor-not-allowed"
            }`}
            style={canSubmit ? { backgroundColor: `${GameConfig.purpleColor}` } : undefined}
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

        {gameOver && !hasWon && !lossOpen && (
          <div className="flex flex-col items-center gap-3 mt-6">
            <ShareButton
              puzzleNumber={puzzle.number}
              puzzleDate={puzzle.date}
              lives={lives}
              maxLives={GameConfig.maxLives}
            />
          </div>
        )}
      </main>

      {successOpen && (
        <GameOverModal
          won
          onClose={() => setSuccessOpen(false)}
          puzzleNumber={puzzle.number}
          puzzleDate={puzzle.date}
          lives={lives}
          maxLives={GameConfig.maxLives}
        />
      )}

      {lossOpen && (
        <GameOverModal
          won={false}
          onClose={() => setLossOpen(false)}
          puzzleNumber={puzzle.number}
          puzzleDate={puzzle.date}
          lives={lives}
          maxLives={GameConfig.maxLives}
        />
      )}
    </div>
  );
}