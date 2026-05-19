// lib/GameConfig.tsx

export const GameConfig = {

maxLives: 3,
titleName: "GSB | Play",
description: "Play GSB!",
url: "https://playgsb.com",

duration: {
            delayAfterSubmission: 300, // Delay after submitting your guess  (3 seconds)          
            loadingDelay: 800   
        },

messages: { 
            alreadyGuessed: "Already guessed"
            },

// Puzzle MetaData
puzzleStartDay: "2026-05-17",
puzzleTitle: "GSB",
puzzleSubtitle: "Rank by revenue - Gold Silver Bronze",
puzzleDimension: "800 x 800",
brandDimension: "400 x 400",
submitText: "Submit",
deselectAllText: "Deselect All",

// Color
puzzleBackgroundColors: {

            gold: 'bg-[#FFBF00]',
            silver: 'bg-[#CCCCCC]',
            bronze: 'bg-[#CD7F32]',
            fourth: 'bg-[#FFFFFF]'
        },

lostLifeColor: 'bg-zinc-100',

newsPaperTextColor: 'text-[#000039]',

newsPaperBackgroundColor: 'bg-[#000039]',

puzzleTextColors: {

    gold: 'text-[#FFBF00]',
    silver: 'text-[#CCCCCC]',
    bronze: 'text-[#CD7F32]',
    fourth: 'text-[#FFFFFF]'
},
    }