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
    <div className={`flex items-end justify-center w-full relative z-0 h-[58px] ${faded ? "opacity-30" : ""}`} style={{ marginBottom: "-33px" }}>
      <div
        className="relative overflow-hidden bg-[#4C4CDB]"
        style={{ width: "35px", height: "58px", transform: "rotate(-29deg)", transformOrigin: "bottom center", marginRight: "-13px" }}
      >
        <div className="absolute top-0 bottom-0 bg-[#7386FF]" style={{ left: "50%", transform: "translateX(-50%)", width: "12px" }} />
      </div>
      <div
        className="relative overflow-hidden bg-[#4C4CDB]"
        style={{ width: "35px", height: "58px", transform: "rotate(29deg)", transformOrigin: "bottom center", marginLeft: "-13px" }}
      >
        <div className="absolute top-0 bottom-0 bg-[#7386FF]" style={{ left: "50%", transform: "translateX(-50%)", width: "12px" }} />
      </div>
    </div>
  );
}

interface MedalProps {
  status: MedalVariant;
  shine?: boolean;
  interactive?: boolean;
}

export function Medal({ status, shine, interactive = false }: MedalProps) {
  const isSolved = status === "gold" || status === "silver" || status === "bronze";
  const isFourth = status === "fourth";
  const isFuture = status === "active";
  const isUnsolved = status === "unsolved";
  const colors = MEDAL_COLORS[status] ?? MEDAL_COLORS.bronze;

  const showShine = isSolved && (shine ?? true);

  // Fourth place gets a ribbon too (it's a finished game), just no medal color.
  const hasRibbon = isSolved || isFourth || isFuture;

  return (
    <div className="flex flex-col items-center w-[100px]">
      {hasRibbon && <Ribbon faded={isFuture} />}
      {isUnsolved && <div className="h-[65px] mb-[-20px]" />}

      <div className={`relative z-10 w-[72px] h-[72px] rounded-full flex items-center justify-center overflow-hidden
        ${interactive ? "transition-transform duration-150 hover:scale-105" : ""}
        ${isSolved ? colors.outer : ""}
        ${isFuture ? `${colors.outer} opacity-30` : ""}
        ${isFourth ? "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700" : ""}
        ${isUnsolved ? "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700" : ""}`}>

        {isSolved && <div className={`w-[56px] h-[56px] rounded-full ${colors.inner}`} />}

        {isFuture && (
          <div className={`w-[56px] h-[56px] rounded-full ${colors.inner} flex items-center justify-center`}>
            <span className="text-[#4A67D4] text-xl font-bold">?</span>
          </div>
        )}

        {isFourth && <span className="text-3xl" role="img" aria-label="fourth place">4️⃣</span>}

        {isUnsolved && <span className="text-[#4A67D4] text-xl font-bold">?</span>}

        {showShine && <div className="medal-shine-overlay" />}
      </div>
    </div>
  );
}