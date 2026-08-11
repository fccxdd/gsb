// app/archive/page.tsx

import { getArchivePuzzles } from '@/lib/archiveSanity'
import { ArchiveGrid } from '@/components/ArchiveGrid'
import { GameConfig } from '@/lib/gameConfig'
import { Metadata } from 'next';

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'GSB | Play Archive',
};

export default async function ArchivePage() {
  const today = new Date().toISOString().slice(0, 10)
  const puzzles = await getArchivePuzzles(today)

  return (
    <div className="flex flex-col min-h-screen items-center bg-white font-sans">
    <main className="flex w-full max-w-3xl flex-col items-start px-8 pt-20 pb-10 bg-zinc-50 min-h-screen">      
      <div className="mb-8 w-full">
        <h1 className="font-serif text-6xl font-bold text-black tracking-tight mb-1 text-center">
        <span className="text-black"> The </span>
        <span className={GameConfig.puzzleTextColors.gold}>G</span>
        <span className={GameConfig.puzzleTextColors.silver}>S</span>
        <span className={GameConfig.puzzleTextColors.bronze}>B</span>
        <span className="text-black"> Archive</span>
        </h1>
        <p className="text-[11px] font-mono tracking-[0.12em] uppercase text-slate-500 text-center">
          Mon · Wed · Fri
        </p>
      </div>
      {/* ArchiveGrid is a client component — reads localStorage for medal status */}
      <ArchiveGrid puzzles={puzzles} today={today} />
    </main>
    </div>
  )
}