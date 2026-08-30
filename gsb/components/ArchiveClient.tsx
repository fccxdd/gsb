// components/ArchiveClient.tsx

"use client";

import { useState } from "react";
import { GameConfig } from "@/lib/gameConfig";
import { ArchiveGrid } from "@/components/ArchiveGrid";
import TitleCoins, { TITLE_COINS_STYLES } from "@/components/TitleCoins";
import Loading from "@/components/loading";
import type { ArchivePuzzle } from "@/lib/archiveSanity";

interface ArchiveClientProps {
  puzzles: ArchivePuzzle[];
  today: string;
}

export default function ArchiveClient({ puzzles, today }: ArchiveClientProps) {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <Loading onDone={() => setShowSplash(false)} />;
  }

  return (
    <div className={`flex flex-col min-h-screen items-center font-sans ${GameConfig.pageBackgroundColor}`}>
      <main className={`flex w-full max-w-3xl flex-col items-center px-8 pt-20 pb-10 ${GameConfig.pageBackgroundColor} min-h-screen`}>
        <div className="mb-8 flex flex-col items-center">
          <h1 className="flex flex-col items-center gap-1">
            <span className="font-lora text-6xl font-bold text-black tracking-tight">
              The
            </span>
            <TitleCoins coins={TITLE_COINS_STYLES} />
            <span className="font-lora text-6xl font-bold text-black tracking-tight">
              Archive
            </span>
          </h1>
          <p className="mt-2 text-[15px] font-lora font-bold tracking-[0.12em] uppercase text-[#4A67D4]">
            Mon · Wed · Fri
          </p>
        </div>

        {/* ArchiveGrid is a client component — reads localStorage for medal status */}
        <ArchiveGrid puzzles={puzzles} today={today} />
      </main>
    </div>
  );
}