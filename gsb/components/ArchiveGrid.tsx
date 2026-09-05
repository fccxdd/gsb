'use client'

import { useMemo, useState } from 'react'
import { ArchivePuzzle as Puzzle } from '@/lib/archiveSanity'
import { getAllPuzzleResults, getMedalStatus, MedalStatus } from '@/lib/PuzzleResults'
import { PastPuzzle } from '@/components/PastPuzzles'

interface ArchiveGridProps {
  puzzles: Puzzle[]
  today: string
}

function chunkIntoRows(puzzles: Puzzle[], size = 3): Puzzle[][] {
  const rows: Puzzle[][] = []
  for (let i = 0; i < puzzles.length; i += size) {
    rows.push(puzzles.slice(i, i + size))
  }
  return rows
}

// "2022-03-08" -> "2022-03"
function monthKey(date: string) {
  return date.slice(0, 7)
}

function Stats({ puzzles, statuses }: { puzzles: Puzzle[]; statuses: Record<string, MedalStatus> }) {
  const solved = puzzles.filter(p => ['gold', 'silver', 'bronze'].includes(statuses[p.date]))
  const gold = puzzles.filter(p => statuses[p.date] === 'gold').length

  return (
    <div className="flex gap-8 mt-8 pt-6 border-t border-slate-800">
      {[
        { num: solved.length, label: 'solved' },
        { num: gold, label: 'gold medals' },
      ].map(({ num, label }) => (
        <div key={label} className="flex flex-col gap-0.5">
          <span className="font-lora text-2xl font-bold text-slate-900 leading-none">
            {num}
          </span>
          <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}

function MonthNavButton({
  direction,
  onClick,
  disabled,
}: {
  direction: 'prev' | 'next'
  onClick: () => void
  disabled: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'prev' ? 'Previous month' : 'Next month'}
      className={`flex items-center justify-center w-9 h-9 rounded-full border-2 transition-colors ${
        disabled
          ? 'border-slate-200 text-slate-300 cursor-not-allowed'
          : 'border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer'
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d={direction === 'prev' ? 'M10 3L5 8l5 5' : 'M6 3l5 5-5 5'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

export function ArchiveGrid({ puzzles, today }: ArchiveGridProps) {
  // Read all localStorage results once on mount
  const statuses = useMemo<Record<string, MedalStatus>>(() => {
    getAllPuzzleResults() // warm the cache
    return Object.fromEntries(
      puzzles.map(p => [p.date, getMedalStatus(p.date, today)])
    )
  }, [puzzles, today])

  // All months that actually have puzzles, sorted chronologically.
  const availableMonths = useMemo(() => {
    const keys = Array.from(new Set(puzzles.map(p => monthKey(p.date))))
    return keys.sort()
  }, [puzzles])

  const [monthIndex, setMonthIndex] = useState(() => {
    const currentKey = monthKey(today)
    const idx = availableMonths.indexOf(currentKey)
    return idx === -1 ? availableMonths.length - 1 : idx
  })

  const currentMonthKey = availableMonths[monthIndex]
  const monthPuzzles = useMemo(
    () => puzzles.filter(p => monthKey(p.date) === currentMonthKey),
    [puzzles, currentMonthKey]
  )

  const monthyearLabel = useMemo(() => {
    if (!currentMonthKey) return ''
    const [year, month] = currentMonthKey.split('-').map(Number)
    return new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })
  }, [currentMonthKey])

  const rows = chunkIntoRows(monthPuzzles)

  return (
    <>
      {/* Month nav */}
      <div className="flex items-center justify-between w-full mb-6">
        <MonthNavButton
          direction="prev"
          onClick={() => setMonthIndex(i => Math.max(0, i - 1))}
          disabled={monthIndex <= 0}
        />
        <h2 className="font-lora text-2xl font-bold text-black tracking-tight">
          {monthyearLabel}
        </h2>
        <MonthNavButton
          direction="next"
          onClick={() => setMonthIndex(i => Math.min(availableMonths.length - 1, i + 1))}
          disabled={monthIndex >= availableMonths.length - 1}
        />
      </div>

      {/* Grid */}
      <div className="flex flex-col gap-8 w-full">
        {rows.map((row, ri) => (
          <div key={ri} className="flex gap-5 flex-wrap justify-center">
            {row.map(puzzle => (
              <PastPuzzle
                key={puzzle._id}
                puzzle={puzzle}
                status={statuses[puzzle.date]}
                isToday={puzzle.date === today}
              />
            ))}
          </div>
        ))}
      </div>

      {/* <Stats puzzles={puzzles} statuses={statuses} /> */}
    </>
  )
}