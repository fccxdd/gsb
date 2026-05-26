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
  const raw = localStorage.getItem(KEY_PREFIX + date)
  if (!raw) return null
  try {
    return JSON.parse(raw) as PuzzleResult
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
  if (date === today) return 'active'
  const result = getPuzzleResult(date)
  if (!result || !result.completed) return 'unsolved'
  if (result.livesLost === 0) return 'gold'
  if (result.livesLost !== null && result.livesLost <= 2) return 'silver'
  return 'bronze'
}