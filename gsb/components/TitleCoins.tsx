// components/TitleCoins.tsx

import { GameConfig } from "@/lib/gameConfig";

export const TITLE_COINS_STYLES = [
  {
    letter: "G",
    outer: GameConfig.puzzleBackgroundColors.gold,
    inner: GameConfig.puzzleBackgroundColors.inner_gold,
    text: GameConfig.puzzleTextColors.gold,
  },
  {
    letter: "S",
    outer: GameConfig.puzzleBackgroundColors.silver,
    inner: GameConfig.puzzleBackgroundColors.inner_silver,
    text: GameConfig.puzzleTextColors.silver,
  },
  {
    letter: "B",
    outer: GameConfig.puzzleBackgroundColors.bronze,
    inner: GameConfig.puzzleBackgroundColors.inner_bronze,
    text: GameConfig.puzzleTextColors.bronze,
  },
];

// Tuned independently per breakpoint against real devices — unlike the
// coin's own size (which stays on a smooth vw-based clamp), this is a tiny
// enough offset that a hard breakpoint switch here isn't the visible jump
// the original bug was about. Edit the two values directly to retune.
const LETTER_OFFSET_CLASS = "translate-y-[0.09em] md:translate-y-[0em]";

type TitleCoinStyle = (typeof TITLE_COINS_STYLES)[number];

interface TitleCoinsProps {
  coins?: TitleCoinStyle[];
  sizeClamp?: string; // CSS clamp() controlling the coin's font-size reference
}

export default function TitleCoins({
  coins = TITLE_COINS_STYLES,
  sizeClamp = "clamp(3.25rem, 7vw, 5rem)",
}: TitleCoinsProps) {
  return (
    <div className="flex mt-2">
      {coins.map(({ letter, outer, inner, text }, i) => (
        <div
          key={letter}
          className={`relative rounded-full flex items-center justify-center ${outer}`}
          style={{
            fontSize: sizeClamp, // single scale reference for this coin
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
              className={`font-luckiest leading-none ${text} ${LETTER_OFFSET_CLASS}`}
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
