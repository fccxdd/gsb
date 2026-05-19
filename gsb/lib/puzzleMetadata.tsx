export type Company = {
  id: number;
  name: string;
  logoSrc: string;
  revenue: string;
  correctRank: 1 | 2 | 3 | 4;
  newspaperClipping: string;

};

export type Puzzle = {
  date: string;
  year: string;
  revenueRange: string;
  companies: Company[];
};

export const todaysPuzzle: Puzzle = {
  date: "2025-05-17",
  year: "2002",
  revenueRange: "$5b - $15b",
  companies: [
    {
      id: 0,
      name: "Apple",
      logoSrc: "/company_logos/apple.png",
      revenue: "$5.74b",
      correctRank: 4,
      newspaperClipping: "/newspaper_clippings/apple_news.png"
    },
    {
      id: 1,
      name: "Nike",
      logoSrc: "/company_logos/nike.png",
      revenue: "$9.89b",
      correctRank: 3,
      newspaperClipping: "/newspaper_clippings/nike_news.png"
    },
    {
      id: 2,
      name: "Toys R Us",
      logoSrc: "/company_logos/toys_r_us.png",
      revenue: "$11.1b",
      correctRank: 2,
      newspaperClipping: "/newspaper_clippings/toys_r_us_news.png"
    },
    {
      id: 3,
      name: "Burger King",
      logoSrc: "/company_logos/burger_king.png",
      revenue: "$11.3b",
      correctRank: 1,
      newspaperClipping: "/newspaper_clippings/burger_king_news.png"
    },
  ],
};