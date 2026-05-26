// lib/archiveSanity.ts

import { client } from './sanity'

export interface ArchivePuzzle {
  _id: string
  date: string       // 'YYYY-MM-DD'
  fiscalYear: number
}

// Only fetches puzzles up to and including today
export async function getArchivePuzzles(today: string): Promise<ArchivePuzzle[]> {
  return client.fetch(
    `*[_type == "puzzle" && date <= $today] | order(date asc) {
      _id,
      date,
      fiscalYear
    }`,
    { today }
  )
}