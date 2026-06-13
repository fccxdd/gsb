// lib/PuzzleResults.ts
export interface PuzzleResult {
  completed: boolean
  livesLost: number | null  // null = not completed (unsolved)
}

const KEY_PREFIX = 'puzzle_result_'

export function savePuzzleResult(date: string, result: PuzzleResult): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY_PREFIX + date, JSON.stringify(result))
}

export function getPuzzleResult(date: string): PuzzleResult | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('gsb_game_state')
    if (!raw) return null
    const state = JSON.parse(raw)
    if (state.date !== date) return null
    if (!state.hasWon && !state.gameOver) return null
    return {
      completed: state.hasWon,
      livesLost: state.hasWon ? (3 - state.lives) : null
    }
  } catch {
    return null
  }
}

export function getAllPuzzleResults(): Record<string, PuzzleResult> {
  if (typeof window === 'undefined') return {}
  const results: Record<string, PuzzleResult> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(KEY_PREFIX)) {
      const date = key.slice(KEY_PREFIX.length)
      const result = getPuzzleResult(date)
      if (result) results[date] = result
    }
  }
  return results
}

export type MedalStatus = 'gold' | 'silver' | 'bronze' | 'unsolved' | 'active'

export function getMedalStatus(date: string, today: string): MedalStatus {
  const result = getPuzzleResult(date)
  if (result?.completed) {
    if (result.livesLost === 0) return 'gold'
    if (result.livesLost === 1) return 'silver'
    return 'bronze'
  }
  if (date > today) return 'active'
  if (date === today) return 'unsolved'
  return 'unsolved'
}