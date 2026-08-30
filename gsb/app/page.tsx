// app/page.tsx

import { getTodaysPuzzle } from '@/lib/getPuzzle'
import HomeClient from '@/components/HomeClient'

export default async function Home() {
  const puzzle = await getTodaysPuzzle()

  return <HomeClient puzzle={puzzle} />
}