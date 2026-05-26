// lib/GameConfig.tsx

export const GameConfig = {
  maxLives: 3,
  titleName: "GSB | Play",
  description: "Play GSB!",
  url: "https://playgsb.com",

  duration: {
    // page.tsx
    delayAfterSubmission: 800,      // wait before evaluating a guess
    shakeAnimation: 1200,           // how long incorrect tiles shake
    slidePerTile: 700,              // gap between each tile sliding on game over
    revealPerRank: 400,             // gap between each revenue reveal
    successModalDelay: 600,         // wait after reveals before showing modal
    partialCorrectSettle: 500,      // extra buffer after partial correct slides finish

    // PuzzleGrid / useTileAnimation
    tileSlide: 1200,                 // how long a single tile takes to slide to its slot

    // PuzzleGrid (revenue reveal)
    revenueLogoSlide: 700,          // logo slides left on reveal
    revenueFadeIn: 700,             // revenue number fades in
    revenueFadeDelay: 300,          // delay before revenue fades in

    // Loading
    loadingDelay: 800,
  },

  messages: {
    alreadyGuessed: "Already guessed"
  },

  // Puzzle Metadata
  puzzleStartDay: "2026-05-17",
  puzzleTitle: "GSB",
  puzzleSubtitle: "Rank by revenue - Gold Silver Bronze",
  puzzleDimension: "800 x 800",
  brandDimension: "400 x 400",
  submitText: "Submit",
  deselectAllText: "Deselect All",

  
  // Add this alongside puzzleBackgroundColors:
  puzzleBackgroundHex: {
    gold:   "#FFBF00",
    silver: "#CCCCCC",
    bronze: "#CD7F32",
    fourth: "#FFFFFF",
  },
  
  // Colors
  puzzleBackgroundColors: {
    gold: 'bg-[#FFBF00]',
    inner_gold: 'bg-[#FAA70D]',
    silver: 'bg-[#CCCCCC]',
    inner_silver: 'bg-[#AFAEAE]',
    bronze: 'bg-[#CD7F32]',
    inner_bronze: 'bg-[#A85C10]',
    fourth: 'bg-[#FFFFFF]'
  },

  lostLifeColor: {
                    outer: 'bg-zinc-100',
                    inner: 'bg-zinc-200'
                },
  newsPaperTextColor: 'text-[#000039]',
  newsPaperBackgroundColor: 'bg-[#000039]',
  puzzleTextColors: {
    gold: 'text-[#FFBF00]',
    silver: 'text-[#CCCCCC]',
    bronze: 'text-[#CD7F32]',
    fourth: 'text-[#FFFFFF]'
  },
}