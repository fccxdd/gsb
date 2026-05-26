// app/page.tsx

import { getTodaysPuzzle } from '@/lib/getPuzzle'
import GamePageWrapper from '@/components/GamePageWrapper'

export default async function Home() {
  const puzzle = await getTodaysPuzzle()

  if (!puzzle) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">No puzzle today - A new puzzle is uploaded every Monday / Wednesday / Friday. Play the past puzzles here</p>
      </div>
    )
  }

  return <GamePageWrapper puzzle={puzzle} />
}