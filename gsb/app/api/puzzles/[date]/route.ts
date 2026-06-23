// app/api/puzzles/[date]/route.ts
import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity'
import { getArchivePuzzles } from '@/lib/archiveSanity'

export async function generateStaticParams() {
  const today = new Date().toISOString().slice(0, 10)
  const puzzles = await getArchivePuzzles(today)
  return puzzles.map(p => ({ date: p.date }))
}

export async function GET(
  request: Request,
  { params }: { params: { date: string } }
) {
  const { date } = await params

  const puzzle = await client.fetch(
    `*[_type == "puzzle" && date == $date][0] {
      _id,
      date,
      fiscalYear
    }`,
    { date }
  )

  if (!puzzle) {
    return NextResponse.json({ error: 'Puzzle not found' }, { status: 404 })
  }

  return NextResponse.json({ puzzle })
}