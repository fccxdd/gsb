// lib/getPuzzleNumber.ts
import { GameConfig } from "@/lib/gameConfig";

export function getPuzzleNumber(puzzleDateStr: string): string {
  const startDate = new Date(GameConfig.puzzleStartDay);
  const puzzleDate = new Date(puzzleDateStr);

  let count = 1;
  const cursor = new Date(startDate);

  while (cursor < puzzleDate) {
    cursor.setDate(cursor.getDate() + 1);
    const day = cursor.getDay(); // 0=Sun, 1=Mon, 3=Wed, 5=Fri
    if (day === 1 || day === 3 || day === 5) {
      count++;
    }
  }

  return String(count).padStart(2, "0");
}
