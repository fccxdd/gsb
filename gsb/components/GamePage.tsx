// components/GamePage.tsx

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IoHomeOutline, IoHelpCircleOutline } from "react-icons/io5";
import { GameConfig } from "@/lib/gameConfig";
import PuzzleGrid from "@/components/PuzzleGrid";
import NewspaperModal from "@/components/NewsPaperModal";
import SplashScreen from "@/components/SplashScreen";
import LifeBar from "@/components/LifeBar";
import ShareButton from "@/components/ShareButton";
import GameOverModal from "@/components/GameOverModal";
import HowToPlayModal from "@/components/HowToPlayModal";
import { saveGameState, loadGameState } from "@/lib/gameStorage";
import type { Puzzle } from "@/types";
import TitleCoins, {TITLE_COINS_STYLES} from "@/components/TitleCoins";

// ── Constants ────────────────────────────────────────────────────────────────

const RANK_TO_SLOT: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3 };

function wait(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
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
  // Only ids actually present in this round's pool can claim a slot — guards
  // against a stale/leaked id ever producing a slot collision or a tile that
  // drops out of the grid entirely.
  const validCorrectIds = correctIds.filter((id) => visualSlots[id] !== undefined);
  const correctSet = new Set(validCorrectIds);

  // Correct tiles go straight to their rank's slot.
  const result: Record<number, number> = {};
  const claimedSlots = new Set<number>();
  validCorrectIds.forEach((id) => {
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
    // Better a tile that doesn't move than one assigned `undefined` and
    // dropped from the grid.
    result[id] = availableForLeftovers[i] !== undefined ? availableForLeftovers[i] : visualSlots[id];
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
  const [newspaperMessage, setNewspaperMessage] = useState(() => {
    if (!saved?.gameOver) return GameConfig.newsPaperText.default;
    return saved?.hasWon ? GameConfig.newsPaperText.win : GameConfig.newsPaperText.loss;
  });
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  
  // resolvedSlots drives both the animation and the post-animation state update.
  // It's set before the animation starts and cleared after styles are wiped.
  const [resolvedSlots,  setResolvedSlots]  = useState<Record<number, number>>({});
  
  // Tiles that have finished animating but aren't officially snapped yet.
  // Keeps them colored correctly during the partialCorrectSettle delay.
  const [pendingSnapIds, setPendingSnapIds] = useState<number[]>([]);
  
  // Tiles actively animating TO their correct slot (gets rank color during animation).
  // Displaced bystander tiles are in resolvedSlots but NOT here, so they stay white.
  const [snappingIds, setSnappingIds] = useState<number[]>([]);

  // Wrong tiles get a brief pop-in flourish on a loss, right before they slide
  // to their correct slot.
  const [popIds, setPopIds] = useState<number[]>([]);

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

  // Reverse lookup for the staggered loss reveal below, which walks ranks
  // rather than ids.
  const getCompanyIdByRank = useCallback(
    (rank: number) => puzzle.companies.find((c) => c.correctRank === rank)!.id,
    [puzzle.companies],
  );

  // Reveal every rank in order: 4th first (invisible until this runs, since
  // PuzzleGrid never shows rank 4 outside this sequence), then bronze,
  // silver, gold last, with each pause a bit longer than the last so gold
  // feels earned. Used by the WIN path, which always reveals all four at
  // once. The loss path has its own staggered version below because it also
  // needs to skip already-revealed ranks and stagger the tile color, not
  // just the revenue.
  async function revealRanks() {
    const order = GameConfig.duration.revealOrder;
    const steps = GameConfig.duration.revealSteps;
    for (let i = 0; i < order.length; i++) {
      await wait(steps[i]);
      const rank = order[i];
      setRevealedRanks((prev) => (prev.includes(rank) ? prev : [...prev, rank]));
    }
  }

  // The JS reveal loop resolves the instant the last rank is added to state,
  // but that tile's revenue badge still has to run its own CSS fade
  // (revenueFadeDelay, then revenueFadeIn) before it's actually visible.
  // Callers that pop a modal right after a reveal sequence should wait this
  // out first, or the modal shows up while the last badge is still fading in.
  async function waitForRevealSettle() {
    await wait(GameConfig.duration.revenueFadeDelay + GameConfig.duration.revenueFadeIn);
  }

  // Animate tiles to their resolved positions. Returns the ids that actually
  // moved so the caller can clean up their CSS transforms via settleStyles —
  // only after the caller has applied the permanent layout (visualPos/snapIds),
  // so the transform doesn't get cleared while the tile's real grid slot is
  // still the old one (which caused a one-frame flash/snap-back).
  // correctIds: the tiles actually snapping into place (get rank color during animation).
  // Displaced bystanders are in `resolved` but not in correctIds — they stay white.
  // baseDisplayOrder defaults to the component's current displayOrder, but
  // callers that already have a fresher {id, slot} snapshot than what's in
  // React state right now (see autoSolve) can pass it explicitly — needed
  // because state updates made earlier in the SAME async handler haven't
  // re-rendered yet, so the component's own displayOrder can be one step
  // behind at this point in the chain.
  async function animateAndSettle(
    resolved: Record<number, number>,
    correctIds: number[],
    baseDisplayOrder: { id: number; slot: number }[] = displayOrder,
  ) {
    setSnappingIds(correctIds);
    setResolvedSlots(resolved);
    await wait(GameConfig.duration.tileSlide);
    return baseDisplayOrder
      .filter((e) => resolved[e.id] !== undefined && resolved[e.id] !== e.slot)
      .map((e) => e.id);
  }

  // Clears the now-redundant slide transforms. Call only after the permanent
  // layout state (visualPos/snapIds) has been applied, so this doesn't run
  // ahead of the re-render that puts the tile in its real final slot.
  function settleStyles(movedIds: number[]) {
    clearStylesRef.current?.(movedIds);
    setResolvedSlots({});
    setSnappingIds([]);
  }

  function handleDeselect() {
    setOrderedIds([]);
    setIncorrectIds([]);
  }

  // Used when the player loses — solve the board automatically.
  //
  // Takes currentSnapIds/currentPositions as explicit params rather than
  // reading the visualPos/displayOrder React state directly. This matters
  // because when a loss happens on the same guess as a correct partial
  // match, autoSolve runs immediately after runWrongGuess's setVisualPos —
  // still within the same handleSubmit call, before React has re-rendered.
  // The component's visualPos/displayOrder at that point still reflect the
  // PREVIOUS round, not the correct positions runWrongGuess just computed.
  // Reading them directly caused a real bug: a tile that had just been
  // correctly snapped this round kept its stale old slot instead of its
  // real rank slot, which could collide with an unsolved tile being forced
  // onto that same slot moments later — producing a duplicated/missing tile.
  async function autoSolve(currentSnapIds: number[], currentPositions: Record<number, number>) {
    const unsolvedIds = puzzle.companies
      .map((c) => c.id)
      .filter((id) => !currentSnapIds.includes(id));

    // An accurate {id, slot} snapshot built from the positions the caller
    // just computed, not from the component's (possibly one-render-stale)
    // displayOrder.
    const currentDisplayOrder = Object.entries(currentPositions).map(([id, slot]) => ({
      id: Number(id),
      slot,
    }));

    const currentVisual = buildVisualSlots(currentDisplayOrder, currentSnapIds);
    const resolved = resolveSwaps(currentVisual, unsolvedIds, RANK_TO_SLOT, getCompany);

    setGameOver(true);
    // Deliberately NOT resetting revealedRanks here. Any tile the player
    // already got right mid-game is already snapped and revealed — it should
    // keep showing its revenue straight through the loss sequence rather
    // than flash hidden and then get re-revealed with everyone else.

    // Give the player a beat to see the board, then pop the wrong tiles
    // individually, one after another, before sliding them home.
    await wait(GameConfig.duration.lossPopDelay);
    setNewspaperMessage(GameConfig.newsPaperText.loss);
    for (const id of unsolvedIds) {
      setPopIds((prev) => [...prev, id]);
      await wait(GameConfig.duration.lossPopStagger);
    }
    await wait(GameConfig.duration.lossPop);
    setPopIds([]);
    await wait(GameConfig.duration.lossPopToSlideDelay);

    // Slide the wrong tiles home as white/displaced — color and revenue are
    // applied afterward, staggered per tile below, not the moment the slide starts.
    const movedIds = await animateAndSettle(resolved, [], currentDisplayOrder);

    // Start from the accurate positions passed in: the already-correct tiles
    // keep the real rank slot they were just placed at (not a stale one),
    // and only the still-unsolved tiles get force-placed onto their slot.
    const finalPos = { ...currentPositions };
    unsolvedIds.forEach((id) => { finalPos[id] = RANK_TO_SLOT[getCompany(id).correctRank]; });
    setVisualPos(finalPos);
    settleStyles(movedIds);

    // Snap + reveal the remaining tiles one at a time, lowest revenue (4th)
    // to highest (gold) — skipping any rank already revealed from a mid-game
    // correct guess — so neither the color nor the revenue pops in for every
    // remaining tile all at once.
    const remainingOrder = GameConfig.duration.revealOrder.filter((r) => !revealedRanks.includes(r));
    const steps = GameConfig.duration.revealSteps;

    for (let i = 0; i < remainingOrder.length; i++) {
      await wait(steps[i]);
      const rank = remainingOrder[i];
      const id = getCompanyIdByRank(rank);
      setSnapIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      setRevealedRanks((prev) => (prev.includes(rank) ? prev : [...prev, rank]));
    }

    await waitForRevealSettle();
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
    // Don't reset revealedRanks — any tile already correctly guessed mid-game
    // is already snapped and showing its revenue; keep it that way instead of
    // hiding and re-revealing it here.

    const resolved = resolveSwaps(buildVisualSlots(displayOrder, snapIds), orderedIds, RANK_TO_SLOT, getCompany);
    const movedIds = await animateAndSettle(resolved, orderedIds);

    const finalPos: Record<number, number> = { ...visualPos };
    orderedIds.forEach((id) => { finalPos[id] = RANK_TO_SLOT[getCompany(id).correctRank]; });
    setVisualPos(finalPos);
    setSnapIds(puzzle.companies.map((c) => c.id));
    settleStyles(movedIds);

    // Reveal only the ranks not already revealed from a mid-game correct guess
    // — lowest to highest, staggered, same suspense ramp as the loss path.
    // On a typical win this is just rank 4, since 1-3 are usually already
    // revealed by the time the player locks in the last correct pick.
    const remainingOrder = GameConfig.duration.revealOrder.filter((r) => !revealedRanks.includes(r));
    const steps = GameConfig.duration.revealSteps;

    setNewspaperMessage(GameConfig.newsPaperText.win);

    for (let i = 0; i < remainingOrder.length; i++) {
      await wait(steps[i]);
      const rank = remainingOrder[i];
      setRevealedRanks((prev) => (prev.includes(rank) ? prev : [...prev, rank]));
    }

    await waitForRevealSettle();
    await wait(GameConfig.duration.successModalDelay);
    setSuccessOpen(true);
  }

  // Wrong guess: shake the bad tiles, snap any partial-correct ones into place,
  // and pin the rest. Returns who's snapped and where everyone actually ended
  // up, so the caller (handleSubmit) can pass the real, up-to-date positions
  // into autoSolve on a loss instead of letting it read React state that
  // hasn't re-rendered yet.
  async function runWrongGuess(
    wrong: number[],
    correct: number[],
  ): Promise<{ finalSnapIds: number[]; finalPositions: Record<number, number> }> {
    setIncorrectIds(wrong);
    await wait(GameConfig.duration.shakeAnimation);
    setIncorrectIds([]);

    // Every id in this guess — right or wrong — has now been evaluated, so
    // none of them should carry over as "selected" into the next round. A
    // correct-but-unsnapped 4th-place pick used to survive a wrong/right-only
    // filter here, leak into the next guess, and corrupt both the rank
    // coloring and gradeGuess's slot alignment on the following round.
    setOrderedIds([]);

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
      const pinned = lockRemaining(carried, displayOrder);
      setVisualPos(pinned);
      return { finalSnapIds: snapIds, finalPositions: pinned };
    }

    const resolved = resolveSwaps(buildVisualSlots(displayOrder, snapIds), correctNonFourth, RANK_TO_SLOT, getCompany);

    setPendingSnapIds(correctNonFourth);
    // Slide the tiles home first, then bring in the rank colors.
    const movedIds = await animateAndSettle(resolved, correctNonFourth);

    // Hold the color through the settle delay, but don't snap yet — snapping
    // early makes the color pop in too soon.

    const finalSnapIds = [...snapIds, ...correctNonFourth];
    const merged = lockRemaining({ ...carried, ...resolved }, displayOrder);
    setVisualPos(merged);
    settleStyles(movedIds);

    await wait(GameConfig.duration.partialCorrectSettle);

    // Now snap and reveal together. Snapping any earlier paints the rank
    // background before the reveal animation gets to play.
    setPendingSnapIds([]);
    setSnapIds(finalSnapIds);
    correctNonFourth.forEach((id) => {
      const rank = getCompany(id).correctRank;
      setRevealedRanks((prev) => (prev.includes(rank) ? prev : [...prev, rank]));
    });

    return { finalSnapIds, finalPositions: merged };
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

    const { finalSnapIds, finalPositions } = await runWrongGuess(wrong, correct);

    if (newLives === 0) await autoSolve(finalSnapIds, finalPositions);
    setIsSubmitting(false);
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className={`relative flex flex-1 flex-col items-center font-sans ${GameConfig.pageBackgroundColor}`}>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}

      <div className="absolute top-4 left-4 z-10">
        <Link
          href="/"
          aria-label="Home"
          className="flex items-center justify-center w-9 h-9 rounded-full text-zinc-500 hover:text-zinc-800 hover:bg-black/5 transition-colors cursor-pointer"
        >
          <IoHomeOutline className="text-3xl" />
        </Link>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setHowToPlayOpen(true)}
          aria-label="How to play"
          className="flex items-center justify-center w-9 h-9 rounded-full text-zinc-500 hover:text-zinc-800 hover:bg-black/5 transition-colors cursor-pointer"
        >
          <IoHelpCircleOutline className="text-4xl" />
        </button>
      </div>

      <main className="relative flex w-full max-w-3xl flex-col items-center pt-[clamp(8px,3vh,24px)] sm:pt-10 pb-[clamp(4px,1.5vh,12px)] sm:pb-6">
        <div className="flex mt-[clamp(2px,1vh,8px)] sm:mt-2">
          <TitleCoins coins={TITLE_COINS_STYLES} />
        </div>

        <h2 className="text-xl font-lora md:text-2xl mt-[clamp(2px,1vh,12px)] sm:mt-3 tracking-wide font-bold">
          Rank by revenue -{" "}
          <span className={GameConfig.puzzleTextColors.gold}>Gold</span>{" "}
          <span className={GameConfig.puzzleTextColors.silver}>Silver</span>{" "}
          <span className={GameConfig.puzzleTextColors.bronze}>Bronze</span>
        </h2>

        <p className="text-2xl font-lora md:text-3xl font-bold" style={{ color: GameConfig.purpleColor }}>
          {puzzle.fiscalYear}
        </p>

        <p className="text-lg font-lora md:text-xl font-bold italic">
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
          popIds={popIds}
          isSubmitting={isSubmitting}
          revealedRanks={revealedRanks}
          resolvedSlots={resolvedSlots}
          clearStylesRef={clearStylesRef}
        />

        <div className="w-full flex justify-center">
          <button
            onClick={() => setNewspaperOpen(true)}
            className="relative cursor-pointer hover:opacity-70 transition-opacity"
          >
            {/* Newsboy illustration — centered on the gap between the grid tiles */}
            <Image
              src="/newsboy.png"
              alt="Open newspaper"
              width={76}
              height={76}
              className="block"
            />

            {/* Speech bubble — hangs off to the right of the illustration */}
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-1 sm:ml-2 bg-white border-2 border-zinc-800 rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2">
              <div className="absolute -left-2 top-3 w-0 h-0
                              border-t-8 border-t-transparent
                              border-b-8 border-b-transparent
                              border-r-10 border-r-zinc-800" />
              <div className="absolute -left-1.5 top-3 w-0 h-0
                              border-t-7 border-t-transparent
                              border-b-7 border-b-transparent
                              border-r-9 border-r-white" />

              <span className="font-gaegu text-lg sm:text-xl text-zinc-800 leading-tight whitespace-pre-line">
                {newspaperMessage}
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

        <div className="flex gap-3 mt-[clamp(8px,2.5vh,24px)] sm:mt-6">
          <button
            onClick={handleDeselect}
            disabled={!canDeselect}
            className={`px-4 py-1.5 rounded-full border text-md transition-colors ${
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
            className={`px-4 py-1.5 rounded-full border text-md transition-colors ${
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

      {howToPlayOpen && <HowToPlayModal onClose={() => setHowToPlayOpen(false)} />}
    </div>
  );
}