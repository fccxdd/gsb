import Link from 'next/link'
import { ArchivePuzzle as Puzzle } from '@/lib/archiveSanity'
import { MedalStatus } from '@/lib/PuzzleResults'

interface PuzzleCircleProps {
  puzzle: Puzzle
  status: MedalStatus
  isToday: boolean
}

const MEDAL_COLORS: Record<MedalStatus, { outer: string; inner: string; text: string }> = {
  gold:     { outer: 'bg-amber-400',                        inner: 'bg-amber-500',                        text: 'text-amber-900' },
  silver:   { outer: 'bg-slate-300',                        inner: 'bg-slate-400',                        text: 'text-slate-700' },
  bronze:   { outer: 'bg-amber-700',                        inner: 'bg-amber-800',                        text: 'text-amber-100' },
  unsolved: { outer: 'bg-slate-100 dark:bg-slate-800',      inner: 'bg-slate-200 dark:bg-slate-700',      text: 'text-slate-400' },
  active:   { outer: 'bg-white dark:bg-slate-900',          inner: 'bg-slate-100 dark:bg-slate-800',      text: 'text-slate-400' },
}

function Ribbon() {
  return (
    <div className="flex items-end justify-center w-full mb-[-10px] relative z-10 h-[52px]">
      <div
        className="relative w-[28px] h-[52px] rounded-sm overflow-hidden bg-[#4A67D4]"
        style={{ transform: 'rotate(-18deg)', transformOrigin: 'bottom right', marginRight: '4px' }}
      >
        <div className="absolute top-0 bottom-0 w-[7px] bg-[#9BAAE8]" style={{ left: '50%', transform: 'translateX(-50%)' }} />
      </div>
      <div
        className="relative w-[28px] h-[52px] rounded-sm overflow-hidden bg-[#4A67D4]"
        style={{ transform: 'rotate(18deg)', transformOrigin: 'bottom left', marginLeft: '4px' }}
      >
        <div className="absolute top-0 bottom-0 w-[7px] bg-[#9BAAE8]" style={{ left: '50%', transform: 'translateX(-50%)' }} />
      </div>
    </div>
  )
}

// Derive a display number from the date for the circle label
function puzzleLabel(date: string): string {
  // You can replace this with a real puzzle number if you add it to the Sanity query
  return date.slice(5) // e.g. "05-05"
}

export function PastPuzzle({ puzzle, status, isToday }: PuzzleCircleProps) {
  const { date, fiscalYear } = puzzle
  const isSolved = ['gold', 'silver', 'bronze'].includes(status)
  const colors = MEDAL_COLORS[status]

  const circleContent = (
    <div className="flex flex-col items-center">
      {isSolved ? <Ribbon /> : <div className="h-[52px] mb-[-10px]" />}

      {/* Outer ring */}
      <div
        className={`
          w-[72px] h-[72px] rounded-full flex items-center justify-center
          transition-transform duration-150 hover:scale-105
          ${colors.outer}
          ${!isSolved ? 'border-2 border-dashed border-slate-300 dark:border-slate-600' : ''}
        `}
      >
        {/* Inner disc */}
        <div className={`w-[54px] h-[54px] rounded-full flex flex-col items-center justify-center ${colors.inner}`}>
          {isSolved && (
            <span className={`font-serif text-[15px] font-bold leading-none ${colors.text}`}>
              {puzzleLabel(date)}
            </span>
          )}
          {isToday && (
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">play</span>
          )}
          {status === 'unsolved' && (
            <span className="text-slate-400 text-sm">✗</span>
          )}
        </div>
      </div>

      {/* Fiscal year */}
      <span className={`mt-2 text-[11px] font-mono tracking-tight ${isToday ? 'text-blue-500 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
        {fiscalYear}
        {isToday && (
          <span className="ml-1.5 text-[9px] bg-blue-50 dark:bg-blue-950 text-blue-500 px-1.5 py-0.5 rounded-full">
            today
          </span>
        )}
      </span>

      {isToday && (
        <Link
          href={`/puzzle/${date}`}
          className="mt-1 text-[11px] font-mono tracking-widest uppercase bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3 py-1.5 rounded hover:opacity-75 transition-opacity"
        >
          Play ↗
        </Link>
      )}
    </div>
  )

  if (isSolved) {
    return (
      <Link href={`/puzzle/${date}`} className="block cursor-pointer">
        {circleContent}
      </Link>
    )
  }

  return <div>{circleContent}</div>
}