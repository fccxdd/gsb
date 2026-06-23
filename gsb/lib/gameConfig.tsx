// lib/GameConfig.tsx

export const GameConfig = {
  
  // SEO Metadata
  titleName: "GSB | Play",
  description: "Play GSB - The trivia game where players rank 4 different companies based on revenue.",
  url: "https://playgsb.com",
  imageURL: "https://playgsb.com/gsb-preview.png",

  // Puzzle Metadata
  puzzleStartDay: "2026-06-08",
  puzzleTitle: "GSB",
  puzzleSubtitle: "Rank by revenue - Gold Silver Bronze",
  maxLives: 3,
  storagePrefix: "gsb_",
  
  // Button Text
  submitText: "Submit",
  deselectAllText: "Deselect All",

  // Game Timing (in ms)
  duration: {
              // Game Play (used in GamePage.tsx)
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
  
  // Messages
  messages: {
    alreadyGuessed: "Already guessed"
  },
  
  // Game Over Text
  gameOver: {
    win: "",
    loss: "Better luck next time!"
  },
  
  // Colors

  puzzleBackgroundHex: {
    gold:   "#FFBF00",
    silver: "#CCCCCC",
    bronze: "#CD7F32",
    fourth: "#FFFFFF",
  },

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
  
  newsPaperTextColor: 'text-[#000000]',
  newsPaperBackgroundColor: 'bg-[#000000]',

  fiscalYearTextColor: 'text-[#4C4CDB]',
  
  revenueRevealColor: 'bg-[#2F8F22]',

  puzzleTextColors: {
    gold: 'text-[#FFBF00]',
    silver: 'text-[#CCCCCC]',
    bronze: 'text-[#CD7F32]',
    fourth: 'text-[#FFFFFF]'
  },
}