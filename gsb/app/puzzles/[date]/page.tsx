// app/puzzles/[date]/page.tsx
import { client } from '@/lib/sanity'
import { getPuzzleNumber } from '@/lib/getPuzzleNumber'
import GamePageWrapper from '@/components/GamePageWrapper'
import SplashScreenNoPuzzle from '@/components/SplashScreenNoPuzzle'

import { getArchivePuzzles } from '@/lib/archiveSanity'

export async function generateStaticParams() {
  const today = new Date().toISOString().slice(0, 10)
  const puzzles = await getArchivePuzzles(today)
  return puzzles.map(p => ({ date: p.date }))
}

interface SanityCompany {
  _key: string
  name: string
  logoSrc: string
  newspaperClipping: string
  revenue: string
  correctRank: 1 | 2 | 3 | 4
  headlines: string[]
}

export default async function PuzzlePage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params

  const raw = await client.fetch(
    `*[_type == "puzzle" && date == $date][0]{
      date,
      fiscalYear,
      revenueRange,
      companies[]{
        _key,
        name,
        "logoSrc": logo.asset->url,
        "newspaperClipping": newspaperImage.asset->url,
        revenue,
        correctRank,
        headlines
      }
    }`,
    { date }
  )

  if (!raw) return <SplashScreenNoPuzzle />

  const puzzle = {
    date: raw.date,
    number: getPuzzleNumber(raw.date),
    fiscalYear: `FY${raw.fiscalYear}`,
    revenueRange: raw.revenueRange,
    companies: raw.companies.map((c: SanityCompany, index: number) => ({
      id: index,
      name: c.name,
      logoSrc: c.logoSrc,
      newspaperClipping: c.newspaperClipping,
      revenue: c.revenue,
      correctRank: c.correctRank,
      headlines: c.headlines ?? [],
    }))
  }

  return <GamePageWrapper puzzle={puzzle} />
}