// lib/gameStorage.ts

import { GameConfig } from "@/lib/gameConfig";

export function storageKey(puzzleDate: string): string {
  return `${GameConfig.storagePrefix}${puzzleDate}`;
}

export interface SavedGameState {
  date: string; // ties the save to its puzzle
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
  localStorage.setItem(storageKey(state.date), JSON.stringify(state));
}

export function loadGameState(puzzleDate: string): SavedGameState | null {
  try {
    const raw = localStorage.getItem(storageKey(puzzleDate));
    if (!raw) return null;
    const state: SavedGameState = JSON.parse(raw);
    if (state.date !== puzzleDate) return null;
    return state;
  } catch {
    return null;
  }
}

export function clearGameState(puzzleDate: string) {
  localStorage.removeItem(storageKey(puzzleDate));
}