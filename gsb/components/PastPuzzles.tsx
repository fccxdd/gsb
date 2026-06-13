import Link from 'next/link'
import { ArchivePuzzle as Puzzle } from '@/lib/archiveSanity'
import { MedalStatus } from '@/lib/PuzzleResults'
import { GameConfig } from '@/lib/gameConfig'

interface PuzzleCircleProps {
  puzzle: Puzzle
  status: MedalStatus
  isToday: boolean
}

const MEDAL_COLORS: Record<string, { outer: string; inner: string }> = {
  gold:   { outer: GameConfig.puzzleBackgroundColors.gold,   inner: GameConfig.puzzleBackgroundColors.inner_gold },
  silver: { outer: GameConfig.puzzleBackgroundColors.silver, inner: GameConfig.puzzleBackgroundColors.inner_silver },
  bronze: { outer: GameConfig.puzzleBackgroundColors.bronze, inner: GameConfig.puzzleBackgroundColors.inner_bronze },
}

function Ribbon({ faded = false }: { faded?: boolean }) {
  return (
    <div className={`flex items-end justify-center w-full relative z-0 h-[58px] ${faded ? 'opacity-30' : ''}`} style={{ marginBottom: '-33px' }}>
      <div
        className="relative overflow-hidden bg-[#4C4CDB]"
        style={{
          width: '35px',
          height: '58px',
          transform: 'rotate(-29deg)',
          transformOrigin: 'bottom center',
          marginRight: '-13px',
        }}
      >
        <div className="absolute top-0 bottom-0 bg-[#7386FF]" style={{ left: '50%', transform: 'translateX(-50%)', width: '12px' }} />
      </div>
      <div
        className="relative overflow-hidden bg-[#4C4CDB]"
        style={{
          width: '35px',
          height: '58px',
          transform: 'rotate(29deg)',
          transformOrigin: 'bottom center',
          marginLeft: '-13px',
        }}
      >
        <div className="absolute top-0 bottom-0 bg-[#7386FF]" style={{ left: '50%', transform: 'translateX(-50%)', width: '12px' }} />
      </div>
    </div>
  )
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
  const colors = MEDAL_COLORS[status] ?? MEDAL_COLORS['bronze']

  console.log(date, status, isSolved, isFuture, isUnsolved)
  const inner = (
    <div className="flex flex-col items-center w-[100px]">
      {/* Ribbon */}
      {(isSolved || isFuture) && <Ribbon faded={isFuture} />}
      {isUnsolved && <div className="h-[65px] mb-[-20px]" />}

      {/* Outer ring */}
      <div className={`relative z-10 w-[72px] h-[72px] rounded-full flex items-center justify-center transition-transform duration-150 hover:scale-105
        ${isSolved ? colors.outer : ''}
        ${isFuture ? `${colors.outer} opacity-30` : ''}
        ${isUnsolved ? 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700' : ''}
      `}>

        {/* Inner disc — solved */}
        {isSolved && (
          <div className={`w-[56px] h-[56px] rounded-full ${colors.inner}`} />
        )}

        {/* Inner disc — future with ? */}
        {isFuture && (
          <div className={`w-[56px] h-[56px] rounded-full ${colors.inner} flex items-center justify-center`}>
            <span className="text-[#4A67D4] text-xl font-bold">?</span>
          </div>
        )}

        {/* Unsolved ? */}
        {isUnsolved && (
          <span className="text-[#4A67D4] text-xl font-bold">?</span>
        )}
      </div>

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

  if (isSolved || isUnsolved) {
    return (
      <Link href="/" className="block cursor-pointer">
        {inner}
      </Link>
    )
  }

  return <div>{inner}</div>
}