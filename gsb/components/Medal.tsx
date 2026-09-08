// components/Medal.tsx

import { GameConfig } from "@/lib/gameConfig";

const MEDAL_COLORS: Record<string, { outer: string; inner: string }> = {
  gold:   { outer: GameConfig.puzzleBackgroundColors.gold,   inner: GameConfig.puzzleBackgroundColors.inner_gold },
  silver: { outer: GameConfig.puzzleBackgroundColors.silver, inner: GameConfig.puzzleBackgroundColors.inner_silver },
  bronze: { outer: GameConfig.puzzleBackgroundColors.bronze, inner: GameConfig.puzzleBackgroundColors.inner_bronze },
};

export type MedalVariant = "gold" | "silver" | "bronze" | "fourth" | "unsolved" | "active";

function Ribbon({ faded = false }: { faded?: boolean }) {
  return (
    <div className={`flex items-end justify-center w-full relative z-0 h-[52px] sm:h-[58px] mb-[-30px] sm:mb-[-33px] ${faded ? "opacity-30" : ""}`}>
      <div
        className="relative overflow-hidden w-[32px] h-[52px] sm:w-[35px] sm:h-[58px] mr-[-12px] sm:mr-[-13px]"
        style={{ backgroundColor: GameConfig.purpleColor, transform: "rotate(-29deg)", transformOrigin: "bottom center" }}
      >
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[11px] sm:w-[12px]" style={{ backgroundColor: GameConfig.ribbonColor }} />
      </div>
      <div
        className="relative overflow-hidden w-[32px] h-[52px] sm:w-[35px] sm:h-[58px] ml-[-12px] sm:ml-[-13px]"
        style={{ backgroundColor: GameConfig.purpleColor, transform: "rotate(29deg)", transformOrigin: "bottom center" }}
      >
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[11px] sm:w-[12px]" style={{ backgroundColor: GameConfig.ribbonColor }} />
      </div>
    </div>
  );
}

interface MedalProps {
  status: MedalVariant;
  shine?: boolean;
  interactive?: boolean;
  ribbon?: boolean;
}

export function Medal({ status, shine, interactive = false, ribbon = true }: MedalProps) {
  const isSolved = status === "gold" || status === "silver" || status === "bronze";
  const isFirst = status === "gold";
  const isFourth = status === "fourth";
  const isActive = status === "active";
  const isUnsolved = status === "unsolved";
  const colors = MEDAL_COLORS[status] ?? MEDAL_COLORS.bronze;

  const showShine = isFirst && (shine ?? true);

  const hasRibbon = (isSolved || isActive) && ribbon;
  const needsSpacer = (isFourth || isUnsolved) && ribbon;

  return (
    <div className="flex flex-col items-center w-[90px] sm:w-[100px]">
      {hasRibbon && <Ribbon faded={isActive} />}
      {needsSpacer && <div className="h-[58px] sm:h-[65px] mb-[-36px] sm:mb-[-40px]" />}

      <div className={`relative z-10 w-[65px] h-[65px] sm:w-[72px] sm:h-[72px] rounded-full flex items-center justify-center overflow-hidden
        ${interactive ? "transition-transform duration-150 hover:scale-105" : ""}
        ${isSolved ? colors.outer : ""}
        ${isActive ? `${colors.outer} opacity-30` : ""}
        ${isFourth ? "bg-white border-4 border-slate-300" : ""}
        ${isUnsolved ? "bg-white border-4 border-slate-300" : ""}`}>

        {isSolved && <div className={`w-[50px] h-[50px] sm:w-[56px] sm:h-[56px] rounded-full ${colors.inner}`} />}

        {isActive && (
          <div className={`w-[50px] h-[50px] sm:w-[56px] sm:h-[56px] rounded-full ${colors.inner} flex items-center justify-center`}>
            <span className="text-[#4A67D4] text-lg sm:text-xl font-bold font-lora">{GameConfig.unsolvedPuzzle}</span>
          </div>
        )}

        {isFourth && (
          <span className="text-[26px] sm:text-3xl font-bold" aria-label="fourth place">
            4<span className="text-sm sm:text-base align-super">th</span>
          </span>
        )}

        {isUnsolved && <span className="text-[#4A67D4] text-lg sm:text-xl font-bold font-lora">{GameConfig.unsolvedPuzzle}</span>}

        {showShine && <div className="medal-shine-overlay" />}
      </div>
    </div>
  );
}