// studio/gsb-studio/schemaTypes/puzzle.ts
export default {
  name: 'puzzle',
  title: 'GSB Daily Puzzle',
  type: 'document',
  fields: [
    {
      name: 'date',
      title: 'Puzzle Date',
      type: 'date',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'fiscalYear',
      title: 'Fiscal Year (e.g. 2020)',
      type: 'string',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'revenueRange',
      title: 'Revenue Range (e.g. $5b - $11b)',
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
            title: 'Revenue (e.g. $11.3B)',
            type: 'string',
            validation: (Rule: any) => Rule.required()
          },
          {
            name: 'correctRank',
            title: 'Correct Rank (1 = highest revenue)',
            type: 'number',
            validation: (Rule: any) => Rule.required().min(1).max(4)
          },
          {
            name: 'headlines',
            title: 'Clue Headlines (2-3)',
            type: 'array',
            of: [{ type: 'string' }],
            validation: (Rule: any) => Rule.min(2).max(3)
          },
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