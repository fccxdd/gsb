import Link from 'next/link'
import { ArchivePuzzle as Puzzle } from '@/lib/archiveSanity'
import { MedalStatus } from '@/lib/PuzzleResults'
import { Medal } from '@/components/Medal'

interface PuzzleCircleProps {
  puzzle: Puzzle
  status: MedalStatus
  isToday: boolean
}

function formatDateLabel(date: string): string {
  const parts = date.split('-')
  return `${parts[1]}/${parts[2]}`
}

export function PastPuzzle({ puzzle, status, isToday }: PuzzleCircleProps) {
  const { date } = puzzle
  const isSolved = ['gold', 'silver', 'bronze'].includes(status)
  const isFuture = status === 'active'
  const isUnsolved = status === 'unsolved'
  const dateLabel = formatDateLabel(date)

  const inner = (
    <div className="flex flex-col items-center">
      <Medal status={status} interactive shine={false} />

      {/* Date label */}
      <span className={`mt-2 text-[11px] font-mono tracking-tight
        ${isToday ? 'text-[#4A67D4] font-semibold' : ''}
        ${isFuture ? 'text-slate-300 dark:text-slate-600' : ''}
        ${!isToday && !isFuture ? 'text-slate-400 dark:text-slate-500' : ''}
      `}>
        {dateLabel}
      </span>
    </div>
  )

  if (isToday) {
    return (
      <Link href="/" className="block cursor-pointer">
        {inner}
      </Link>
    )
  }

  else if (isSolved || (isUnsolved && !isToday)) {
    return (
      <Link href={`/puzzles/${date}`} className="block cursor-pointer">
        {inner}
      </Link>
    )
  }

  return <div>{inner}</div>
}