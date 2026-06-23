// app/page.tsx

import { getTodaysPuzzle } from '@/lib/getPuzzle'
import GamePageWrapper from '@/components/GamePageWrapper'
import SplashScreenNoPuzzle from '@/components/SplashScreenNoPuzzle'

export default async function Home() {
  const puzzle = await getTodaysPuzzle()

  if (!puzzle) {
    return <SplashScreenNoPuzzle />
  }

  return <GamePageWrapper puzzle={puzzle} />
}