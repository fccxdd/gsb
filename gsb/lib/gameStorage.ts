// lib/gameStorage.ts

const STORAGE_KEY = "gsb_game_state";

export interface SavedGameState {
  date: string; // ties the save to today's puzzle
  lives: number;
  gameOver: boolean;
  hasWon: boolean;
  snapIds: number[];
  correctIds: number[];
  lockedPositions: Record<number, number>;
  revealedRanks: number[];
  revealCorrect: boolean;
}

export function saveGameState(state: SavedGameState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadGameState(puzzleDate: string): SavedGameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const state: SavedGameState = JSON.parse(raw);
    // Only restore if it's for today's puzzle
    if (state.date !== puzzleDate) return null;
    return state;
  } catch {
    return null;
  }
}

export function clearGameState() {
  localStorage.removeItem(STORAGE_KEY);
}