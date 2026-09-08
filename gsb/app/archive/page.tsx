// app/archive/page.tsx

import { getArchivePuzzles } from '@/lib/archiveSanity'
import { Metadata } from 'next';
import ArchiveClient from '@/components/archive/ArchiveClient'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'GSB | Play Archive',
};

export default async function ArchivePage() {
  const today = new Date().toISOString().slice(0, 10)
  const puzzles = await getArchivePuzzles(today)

  return <ArchiveClient puzzles={puzzles} today={today} />
}