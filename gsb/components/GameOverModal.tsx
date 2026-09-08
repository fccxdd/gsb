// components/GameOverModal.tsx

"use client";

import Link from "next/link";
import { IoClose } from "react-icons/io5";
import ShareButton from "@/components/ShareButton";
import { Medal, type MedalVariant } from "@/components/Medal";
import { GameConfig } from "@/lib/gameConfig";

interface GameOverModalProps {
  won: boolean;
  onClose: () => void;
  puzzleNumber: string;
  puzzleDate: string;
  lives: number;
  maxLives: number;
}

function livesToStatus(won: boolean, lives: number, maxLives: number): MedalVariant {
  if (!won) return "fourth";
  const lost = maxLives - lives;
  if (lost === 0) return "gold";
  if (lost === 1) return "silver";
  return "bronze";
}

export default function GameOverModal({
  won,
  onClose,
  puzzleNumber,
  puzzleDate,
  lives,
  maxLives,
}: GameOverModalProps) {
  const title    = won ? GameConfig.gameOver.win.title
                      : GameConfig.gameOver.loss.title;
  const subtitle = won ? GameConfig.gameOver.win.subtitle
                      : GameConfig.gameOver.loss.subtitle;

  const status = livesToStatus(won, lives, maxLives);

  return (
    // Backdrop — clicking it closes the modal.
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Stop clicks inside the card from reaching the backdrop. */}
      <div
        className="relative bg-white rounded-2xl px-10 py-8 max-w-xs mx-4 flex flex-col items-center gap-3 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
        >
          <IoClose className="text-2xl" />
        </button>

        <Medal status={status} />

        <h2 className="text-3xl font-bold font-lora text-zinc-800 text-center">{title}</h2>
        <p className="text-zinc-500 font-lora text-md text-center">{subtitle}</p>

        <ShareButton
          puzzleNumber={puzzleNumber}
          puzzleDate={puzzleDate}
          lives={lives}
          maxLives={maxLives}
        />

        <Link
          href="/archive"
          style={{ backgroundColor: GameConfig.purpleColor }}
          className="flex items-center gap-2 px-5 py-2 rounded-full font-lora text-white text-md font-medium hover:bg-purple-500 active:scale-95 transition-all cursor-pointer"
        >
          Play Archive
        </Link>
      </div>
    </div>
  );
}