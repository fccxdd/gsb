// lib/noPuzzleHeading.ts

import { GameConfig } from '@/lib/gameConfig'

// Message to show for a date with no puzzle doc: distinguishes a date
// before the game existed / a day that never gets puzzles ("no new
// puzzle for that day") from a genuine upcoming M/W/F date that just
// hasn't been made yet.
export function getNoPuzzleHeading(date: string): string {
  if (date < GameConfig.puzzleStartDay) return 'No new puzzle for that day'

  const [year, month, day] = date.split('-').map(Number)
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  const isMonWedFri = weekday === 1 || weekday === 3 || weekday === 5

  return isMonWedFri ? "We haven't made that one yet" : 'No new puzzle for that day'
}
