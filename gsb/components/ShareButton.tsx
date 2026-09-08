"use client";

import { useState } from "react";
import { CiShare2 } from "react-icons/ci";
import { GameConfig } from "@/lib/gameConfig";

interface ShareButtonProps {
  puzzleNumber: string;
  puzzleDate: string; // ISO format e.g. "2026-06-06"
  lives: number;      // remaining lives (0–3)
  maxLives?: number;  // default 3
}

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function getMedalResult(remainingLives: number, maxLives: number) {
  const livesLost = maxLives - remainingLives;

  if (livesLost === 0) return { emoji: "🥇", label: "Gold" };
  if (livesLost === 1) return { emoji: "🥈", label: "Silver" };
  if (livesLost === 2) return { emoji: "🥉", label: "Bronze" };
  return { emoji: "4️⃣", label: "4th place" };
}

function buildShareText(
  puzzleNumber: string,
  puzzleDate: string,
  lives: number,
  maxLives: number
): string {
  const { emoji, label } = getMedalResult(lives, maxLives);
  const formattedDate = formatDate(puzzleDate);

  return [
    "GSB",
    "",
    `Puzzle #${puzzleNumber} - ${formattedDate}`,
    "",
    `${emoji} - ${label}`,
    "",
    "Want to compete in today's puzzle?",
    "",
    "Play Here | https://playgsb.com",
  ].join("\n");
}

export default function ShareButton({
  puzzleNumber,
  puzzleDate,
  lives,
  maxLives = GameConfig.maxLives,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareText = buildShareText(puzzleNumber, puzzleDate, lives, maxLives);
  
  const handleShare = async () => {
    
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    if (isMobile && navigator.share) {
        try {
        await navigator.share({ text: shareText });
        return;
        } catch {
        // cancelled or failed — fall through to clipboard
        }
    }

    // Desktop: always copy to clipboard
    try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    } catch {
        window.prompt("Copy your result:", shareText);
    }
    };

  return (
    <button
      onClick={handleShare}
      style={{ backgroundColor: GameConfig.purpleColor }}
      className="flex items-center gap-2 px-5 py-2 rounded-full text-white text-md font-medium hover:bg-zinc-700 active:scale-95 transition-all cursor-pointer"
    >
      <span>{copied ? "✓ Copied!" : "Share Result"}</span>
      {!copied 
      // &&
      // (
      //   <CiShare2 size={14} />
      // )
      }
    </button>
  );
}