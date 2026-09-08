// types/index.ts

export type Company = {
  id: number;
  name: string;
  logoSrc: string;
  newspaperClipping: string;
  revenue: string;
  correctRank: 1 | 2 | 3 | 4;
}

export type Puzzle = {
  date: string;
  number: string;
  fiscalYear: string;
  revenueRange: string;
  companies: Company[];
}