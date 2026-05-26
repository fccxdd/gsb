'use client'

import { useMemo } from 'react'
import { ArchivePuzzle as Puzzle } from '@/lib/archiveSanity'
import { getAllPuzzleResults, getMedalStatus, MedalStatus } from '@/lib/PuzzleResults'
import { PastPuzzle } from '@/components/PastPuzzles'

interface ArchiveGridProps {
  puzzles: Puzzle[]
  today: string
}

function groupByWeek(puzzles: Puzzle[]): Puzzle[][] {
  const weeks: Puzzle[][] = []
  for (let i = 0; i < puzzles.length; i += 3) {
    weeks.push(puzzles.slice(i, i + 3))
  }
  return weeks
}

function Stats({ puzzles, statuses }: { puzzles: Puzzle[]; statuses: Record<string, MedalStatus> }) {
  const solved = puzzles.filter(p => ['gold', 'silver', 'bronze'].includes(statuses[p.date]))
  const gold = puzzles.filter(p => statuses[p.date] === 'gold').length

  let streak = 0
  const past = puzzles.filter(p => statuses[p.date] !== 'active')
  for (let i = past.length - 1; i >= 0; i--) {
    if (['gold', 'silver', 'bronze'].includes(statuses[past[i].date])) streak++
    else break
  }

  return (
    <div className="flex gap-8 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
      {[
        { num: solved.length, label: 'solved' },
        { num: gold, label: 'gold medals' },
        { num: streak, label: 'streak' },
      ].map(({ num, label }) => (
        <div key={label} className="flex flex-col gap-0.5">
          <span className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-100 leading-none">
            {num}
          </span>
          <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 dark:text-slate-500">
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}

const LEGEND = [
  { color: 'bg-amber-400', label: 'Gold — no lives lost' },
  { color: 'bg-slate-300', label: 'Silver — 1–2 lives' },
  { color: 'bg-amber-700', label: 'Bronze — 3+ lives' },
  { color: 'bg-slate-200 dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600', label: 'Unsolved' },
]

export function ArchiveGrid({ puzzles, today }: ArchiveGridProps) {
  // Read all localStorage results once on mount
  const statuses = useMemo<Record<string, MedalStatus>>(() => {
    getAllPuzzleResults() // warm the cache
    return Object.fromEntries(
      puzzles.map(p => [p.date, getMedalStatus(p.date, today)])
    )
  }, [puzzles, today])

  const weeks = groupByWeek(puzzles)

  return (
    <>
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
        {LEGEND.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${color}`} />
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{label}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex flex-col gap-8">
        {weeks.map((week, wi) => (
          <div key={wi}>
            <p className="text-[10px] font-mono tracking-[0.1em] uppercase text-slate-300 dark:border-slate-600 mb-4">
              Week {wi + 1}
            </p>
            <div className="flex gap-5 flex-wrap">
              {week.map(puzzle => (
                <PastPuzzle
                  key={puzzle._id}
                  puzzle={puzzle}
                  status={statuses[puzzle.date]}
                  isToday={puzzle.date === today}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <Stats puzzles={puzzles} statuses={statuses} />
    </>
  )
}