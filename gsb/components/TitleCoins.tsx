// components/TitleCoins.tsx

import { GameConfig } from "@/lib/gameConfig";

export const TITLE_COINS_STYLES = [
  {
    letter: "G",
    outer: GameConfig.puzzleBackgroundColors.gold,
    inner: GameConfig.puzzleBackgroundColors.inner_gold,
    text: GameConfig.puzzleTextColors.gold,
    offsetY: "translate-y-[10%] md:translate-y-[-2%]",
  },
  {
    letter: "S",
    outer: GameConfig.puzzleBackgroundColors.silver,
    inner: GameConfig.puzzleBackgroundColors.inner_silver,
    text: GameConfig.puzzleTextColors.silver,
    offsetY: "translate-y-[10%] md:translate-y-[-2%]",
  },
  {
    letter: "B",
    outer: GameConfig.puzzleBackgroundColors.bronze,
    inner: GameConfig.puzzleBackgroundColors.inner_bronze,
    text: GameConfig.puzzleTextColors.bronze,
    offsetY: "translate-y-[10%] md:translate-y-[-2%]",
  },
];

type TitleCoinStyle = (typeof TITLE_COINS_STYLES)[number];

interface TitleCoinsProps {
  coins?: TitleCoinStyle[];
}

export default function TitleCoins({ coins = TITLE_COINS_STYLES }: TitleCoinsProps) {
  return (
    <div className="flex mt-2">
      {coins.map(({ letter, outer, inner, text, offsetY }, i) => (
        <div
          key={letter}
          className={`relative rounded-full flex items-center justify-center ${outer}`}
          style={{
            fontSize: "clamp(3.25rem, 7vw, 5rem)", // single scale reference for this coin
            width: "1.4em",
            height: "1.4em",
            marginLeft: i > 0 ? "clamp(-0.5rem, -1.5vw, -0.25rem)" : undefined,
            zIndex: coins.length - i,
          }}
        >
          <div
            className={`rounded-full flex items-center justify-center ${inner}`}
            style={{ width: "1.05em", height: "1.05em" }}
          >
            <span
              className={`font-luckiest ${text} ${offsetY}`}
              style={{ fontSize: "1em" }}
            >
              {letter}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}