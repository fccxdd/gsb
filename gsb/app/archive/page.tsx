import { getArchivePuzzles } from '@/lib/archiveSanity'
import { ArchiveGrid } from '@/components/ArchiveGrid'

export const revalidate = 3600

export default async function ArchivePage() {
  const today = new Date().toISOString().slice(0, 10)
  const puzzles = await getArchivePuzzles(today)

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 px-6 py-12 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-1">
          The Archive
        </h1>
        <p className="text-[11px] font-mono tracking-[0.12em] uppercase text-slate-400 dark:text-slate-500">
          Mon · Wed · Fri
        </p>
      </div>
      {/* ArchiveGrid is a client component — reads localStorage for medal status */}
      <ArchiveGrid puzzles={puzzles} today={today} />
    </main>
  )
}