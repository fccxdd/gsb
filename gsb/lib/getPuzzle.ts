import { client } from './sanity'

interface SanityCompany {
  _key: string
  name: string
  logoSrc: string
  newspaperClipping: string
  revenue: string
  correctRank: 1 | 2 | 3 | 4
  headlines: string[]
}

export async function getTodaysPuzzle() {
  const today = new Date().toLocaleDateString('en-CA');

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
    { date: today }
  )

  if (!raw) return null

  return {
    date: raw.date,
    fiscalYear: raw.fiscalYear,
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
}