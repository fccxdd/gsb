"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { GameConfig } from "@/lib/gameConfig";

const TILES = [
  { color: GameConfig.puzzleBackgroundHex.gold,   startSlot: 2, endSlot: 0, logo: "/splash/tech.png" },          // gold:   BL → TL
  { color: GameConfig.puzzleBackgroundHex.silver, startSlot: 0, endSlot: 1, logo: "/splash/food.png" },          // silver: TL → TR
  { color: GameConfig.puzzleBackgroundHex.bronze, startSlot: 3, endSlot: 2, logo: "/splash/auto.png" },          // bronze: BR → BL
  { color: GameConfig.puzzleBackgroundHex.fourth, startSlot: 1, endSlot: 3, logo: "/splash/entertainment.png" }, // fourth: TR → BR
];

function slotToColRow(slot: number): [number, number] {
  return [slot % 2, Math.floor(slot / 2)];
}

interface SplashScreenProps {
  onDone?: () => void;
}

export default function SplashScreen({ onDone }: SplashScreenProps) {
  const tileRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
  const [visible, setVisible] = useState(true);

  const TILE_SIZE = 120;
  const GAP = 12;
  const SLIDE = GameConfig.duration.tileSlide;
  const HALF = SLIDE / 2;

  const animate = () => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const moves = TILES.map((tile) => {
      const [sc, sr] = slotToColRow(tile.startSlot);
      const [ec, er] = slotToColRow(tile.endSlot);
      return {
        dx: (ec - sc) * (TILE_SIZE + GAP),
        dy: (er - sr) * (TILE_SIZE + GAP),
      };
    });

    const nonZeroMoves = moves.filter((m) => m.dx !== 0 || m.dy !== 0);
    const isCross =
      nonZeroMoves.length === 2 &&
      nonZeroMoves.every((m) => m.dx !== 0 && m.dy !== 0) &&
      nonZeroMoves[0].dx === -nonZeroMoves[1].dx &&
      nonZeroMoves[0].dy === -nonZeroMoves[1].dy;

    if (isCross) {
      TILES.forEach((_, i) => {
        const el = tileRefs.current[i];
        const { dx, dy } = moves[i];
        if (!el || (dx === 0 && dy === 0)) return;
        el.style.zIndex = i === 0 ? "10" : "5";
        el.style.transition = `transform ${SLIDE}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      });
    } else {
      // Step 1: horizontal
      TILES.forEach((_, i) => {
        const el = tileRefs.current[i];
        const { dx } = moves[i];
        if (!el || dx === 0) return;
        el.style.transition = `transform ${HALF}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        el.style.transform = `translate(${dx}px, 0px)`;
      });

      // Step 2: vertical
      const hasHorizontal = moves.some((m) => m.dx !== 0);
      const t2 = setTimeout(() => {
        TILES.forEach((_, i) => {
          const el = tileRefs.current[i];
          const { dx, dy } = moves[i];
          if (!el || dy === 0) return;
          el.style.transition = `transform ${HALF}ms cubic-bezier(0.4, 0, 0.2, 1)`;
          el.style.transform = `translate(${dx}px, ${dy}px)`;
        });
      }, hasHorizontal ? HALF : 0);
      timeouts.push(t2);
    }

    // Always schedule fade-out — works for both cross and sequential paths
    const animationDuration = isCross ? SLIDE : HALF + HALF;
    const t3 = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDone?.(), 600);
    }, 200 + animationDuration + 500);
    timeouts.push(t3);

    return () => timeouts.forEach(clearTimeout);
  };

  useEffect(() => {
    const kickoff = setTimeout(() => animate(), 200);
    return () => clearTimeout(kickoff);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gridSize = 2 * TILE_SIZE + GAP;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f4f4f4",
        transition: "opacity 0.6s ease",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div style={{ position: "relative", width: gridSize, height: gridSize }}>
        {TILES.map((tile, i) => {
          const [col, row] = slotToColRow(tile.startSlot);
          return (
            <div
              key={i}
              ref={(el) => { tileRefs.current[i] = el; }}
              style={{
                position: "absolute",
                width: TILE_SIZE,
                height: TILE_SIZE,
                left: col * (TILE_SIZE + GAP),
                top: row * (TILE_SIZE + GAP),
                backgroundColor: tile.color,
                borderRadius: 16,
                border: "1px solid rgba(0,0,0,0.08)",
                willChange: "transform",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ position: "relative", width: 64, height: 64 }}>
                <Image
                  src={tile.logo}
                  alt=""
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}