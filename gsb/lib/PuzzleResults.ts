// lib/PuzzleResults.ts

import { GameConfig } from "@/lib/gameConfig";
import { loadGameState } from "@/lib/gameStorage";

export interface PuzzleResult {
  completed: boolean
  failed: boolean            // game over without a win (ran out of lives)
  livesLost: number | null   // null = not completed
}

export function getPuzzleResult(date: string): PuzzleResult | null {
  if (typeof window === 'undefined') return null
  const state = loadGameState(date)
  if (!state) return null
  if (!state.hasWon && !state.gameOver) return null
  return {
    completed: state.hasWon,
    failed: state.gameOver && !state.hasWon,
    livesLost: state.hasWon ? (GameConfig.maxLives - state.lives) : null,
  }
}

export function getAllPuzzleResults(): Record<string, PuzzleResult> {
  if (typeof window === 'undefined') return {}
  const results: Record<string, PuzzleResult> = {}
  const prefix = GameConfig.storagePrefix
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(prefix)) {
      const date = key.slice(prefix.length)
      const result = getPuzzleResult(date)
      if (result) results[date] = result
    }
  }
  return results
}

export type MedalStatus = 'gold' | 'silver' | 'bronze' | 'fourth' | 'unsolved' | 'active'

export function getMedalStatus(date: string, today: string): MedalStatus {
  const result = getPuzzleResult(date)
  if (result?.completed) {
    if (result.livesLost === 0) return 'gold'
    if (result.livesLost === 1) return 'silver'
    return 'bronze'
  }
  if (result?.failed) return 'fourth'
  if (date > today) return 'active'
  return 'unsolved'
}