// studio/gsb-studio/schemaTypes/puzzle.ts
import {RevenueInput} from '../components/RevenueInput'

export default {
  name: 'puzzle',
  title: 'GSB Daily Puzzle',
  type: 'document',
  fields: [
    {
      name: 'date',
      title: 'Puzzle Date',
      type: 'date',
      validation: (Rule: any) =>
        Rule.required().custom(async (date: string, context: any) => {
          if (!date) return true

          const {document, getClient} = context
          const client = getClient({apiVersion: '2023-01-01'})
          const id = (document._id as string).replace(/^drafts\./, '')

          const existingId = await client.fetch(
            `*[_type == "puzzle" && date == $date && !(_id in [$draftId, $publishedId])][0]._id`,
            {date, draftId: `drafts.${id}`, publishedId: id}
          )

          return existingId ? 'A puzzle for this date already exists' : true
        })
    },
    {
      name: 'fiscalYear',
      title: 'Fiscal Year (e.g. 2020)',
      type: 'number',
      validation: (Rule: any) => Rule.required().min(1900).max(2100).integer()
    },
    {
      name: 'revenueRange',
      title: 'Revenue Range (e.g. $5B - $11B)',
      type: 'string',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'companies',
      title: 'Companies',
      type: 'array',
      validation: (Rule: any) => Rule.required().length(4).error('Must have exactly 4 companies'),
      of: [{
        type: 'object',
        fields: [
          {
            name: 'name',
            title: 'Company Name',
            type: 'string',
            validation: (Rule: any) => Rule.required()
          },
          {
            name: 'logo',
            title: 'Company Logo',
            type: 'image',          // ← upload button in Studio
            options: { hotspot: true }
          },
          {
            name: 'newspaperImage',
            title: 'Newspaper Image',
            type: 'image',          // ← upload button in Studio
            options: { hotspot: true }
          },
          {
            name: 'revenue',
            title: 'Revenue (e.g. $11.3b)',
            type: 'string',
            components: {input: RevenueInput},
            validation: (Rule: any) => Rule.required()
          },
          {
            name: 'correctRank',
            title: 'Correct Rank (1 = highest revenue)',
            type: 'number',
            validation: (Rule: any) => Rule.required().min(1).max(4)
          }
        ]
      }]
    }
  ],
  preview: {
    select: { title: 'date', subtitle: 'fiscalYear' },
    prepare({ title, subtitle }: any) {
      return { title: `Puzzle — ${title}`, subtitle: `FY ${subtitle}` }
    }
  }
}