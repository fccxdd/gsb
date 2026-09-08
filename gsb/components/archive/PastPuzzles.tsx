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
  const isActive = status === 'active'
  const dateLabel = formatDateLabel(date)

  const inner = (
    <div className="flex flex-col items-center">
      <Medal status={status} interactive shine={false} ribbon={false} />

      {/* Date label */}
      <span className={`mt-2 text-[15px] font-lora font-bold italic tracking-tight
        ${isToday ? 'text-[#4A67D4] font-semibold' : ''}
        ${isActive ? 'text-black' : ''}
        ${!isToday && !isActive ? 'text-black' : ''}
      `}>
        {dateLabel}
      </span>
    </div>
  )

  return (
    <Link href={`/puzzles/${date}`} className="block cursor-pointer">
      {inner}
    </Link>
  )
}