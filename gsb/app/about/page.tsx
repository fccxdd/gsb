// app/about/page.tsx

import { Metadata } from 'next'
import { GameConfig } from '@/lib/gameConfig'

export const metadata: Metadata = {
  title: 'GSB | About',
}

const HOW_TO_PLAY = [
  'Select the companies you think generated the most revenue from highest to lowest (Gold Silver Bronze).',
  'Read the Headlines from X00Y to get a glimpse of the industry at that time.',
  'You have 3 chances to solve the puzzle.',
  'Tap Submit to check if you’re correct.',
]

export default function AboutPage() {
  return (
    <div className={`flex flex-col min-h-screen items-center ${GameConfig.pageBackgroundColor} font-lora`}>
      <main className={`flex w-full max-w-3xl flex-col items-center px-8 pt-20 pb-10 ${GameConfig.pageBackgroundColor} min-h-screen`}>
        <h1 className="font-lora text-4xl font-bold text-black tracking-tight mb-8 text-center">
          About GSB
        </h1>

        <p className="font-lora text-base leading-relaxed text-black text-center max-w-xl">
          GSB is a business trivia game where you rank 4 companies based on
          revenue generated in a single year (highest to lowest).
        </p>

        <p className="font-lora text-base leading-relaxed text-black text-center max-w-xl mt-4">
          Read the news articles to assist you as you solve.
        </p>

        <div className="w-full max-w-xl mt-12">
          <h2
            className="font-lora text-2xl font-bold mb-6 text-center"
            style={{ color: GameConfig.purpleColor }}
          >
            How to Play
          </h2>

          <ul className="flex flex-col gap-4">
            {HOW_TO_PLAY.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-white text-sm font-lora font-bold mt-0.5"
                  style={{ backgroundColor: GameConfig.purpleColor }}
                >
                  {i + 1}
                </span>
                <span className="font-lora text-base leading-relaxed text-black">
                  {step}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  )
}