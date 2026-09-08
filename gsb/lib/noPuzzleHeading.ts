// lib/noPuzzleHeading.ts

import { GameConfig } from '@/lib/gameConfig'

// Message to show for a date with no puzzle doc: distinguishes a date
// before the game existed / a day that never gets puzzles ("no new
// puzzle for that day") from a genuine upcoming M/W/F date that just
// hasn't been made yet.
export function getNoPuzzleHeading(date: string): string {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
  const isToday = date === today

  if (date < GameConfig.puzzleStartDay) return 'No new puzzle for that day'

  const [year, month, day] = date.split('-').map(Number)
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  const isMonWedFri = weekday === 1 || weekday === 3 || weekday === 5

  if (isMonWedFri) return "We haven't made that one yet"

  return isToday ? 'No new puzzle for today' : 'No new puzzle for that day'
}
