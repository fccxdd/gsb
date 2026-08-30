"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GameConfig } from "@/lib/gameConfig";
import { Medal } from "@/components/Medal";

const TILES = [
  { color: GameConfig.puzzleBackgroundHex.gold,   startSlot: 2, endSlot: 0, logo: "/splash/tech.png" },
  { color: GameConfig.puzzleBackgroundHex.silver, startSlot: 0, endSlot: 1, logo: "/splash/food.png" },
  { color: GameConfig.puzzleBackgroundHex.bronze, startSlot: 3, endSlot: 2, logo: "/splash/auto.png" },
  { color: GameConfig.puzzleBackgroundHex.fourth, startSlot: 1, endSlot: 3, logo: "/splash/entertainment.png" },
];

function slotToColRow(slot: number): [number, number] {
  return [slot % 2, Math.floor(slot / 2)];
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function slide(el: HTMLElement, x: number, y: number, dur: number, ease = "cubic-bezier(0.4,0,0.2,1)") {
  return new Promise<void>((resolve) => {
    el.style.transition = `transform ${dur}ms ${ease}`;
    el.style.transform = `translate(${x}px,${y}px)`;
    setTimeout(resolve, dur + 16);
  });
}

interface SplashScreenNoPuzzleProps {
  onDone?: () => void;
}

export default function SplashScreenNoPuzzle({ onDone }: SplashScreenNoPuzzleProps) {
  const router = useRouter();
  const tileRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
  const [visible, setVisible] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [, setFilledDots] = useState([false, false]);

  const TILE_SIZE = 120;
  const GAP = 12;
  const STEP = TILE_SIZE + GAP;
  const HALF = GameConfig.duration.tileSlide / 2;

  const moves = TILES.map((tile) => {
    const [sc, sr] = slotToColRow(tile.startSlot);
    const [ec, er] = slotToColRow(tile.endSlot);
    return {
      dx: (ec - sc) * STEP,
      dy: (er - sr) * STEP,
    };
  });

  async function glitchAndSnapBack(
    els: HTMLElement[],
    cxs: number[],
    cys: number[],
    amp: number,
    count: number
  ) {
    for (let j = 0; j < count; j++) {
      const sign = j % 2 === 0 ? 1 : -1;
      await Promise.all(
        els.map((el, k) =>
          slide(el, cxs[k] + sign * amp, cys[k] + sign * amp * 0.25, 55, "linear")
        )
      );
    }
    await Promise.all(els.map((el) => slide(el, 0, 0, 200, "cubic-bezier(0.2,0,0.4,1)")));
  }

  async function attempt(idx: number) {
    const els = tileRefs.current as HTMLElement[];

    const hProg = [0.45][idx];
    const vProg = [0.45][idx];
    const amp   = [7][idx];
    const count = [2][idx];

    // ── Phase 1: horizontal ──
    const hPairs = moves
      .map((m, i) => ({ m, el: els[i] }))
      .filter(({ m }) => m.dx !== 0);

    await Promise.all(hPairs.map(({ el, m }) =>
      slide(el, m.dx * hProg, 0, HALF * hProg)
    ));

    await glitchAndSnapBack(
      hPairs.map(({ el }) => el),
      hPairs.map(({ m }) => m.dx * hProg),
      hPairs.map(() => 0),
      amp,
      count
    );

    await sleep(120);

    // ── Phase 2: vertical ──
    const vPairs = moves
      .map((m, i) => ({ m, el: els[i] }))
      .filter(({ m }) => m.dy !== 0);

    await Promise.all(vPairs.map(({ el, m }) =>
      slide(el, 0, m.dy * vProg, HALF * vProg)
    ));

    await glitchAndSnapBack(
      vPairs.map(({ el }) => el),
      vPairs.map(() => 0),
      vPairs.map(({ m }) => m.dy * vProg),
      amp,
      count
    );
  }

  useEffect(() => {
    let cancelled = false;

    async function run() {
      await sleep(300);

      for (let i = 0; i < 1; i++) {
        if (cancelled) return;
        await attempt(i);
        if (cancelled) return;
        setFilledDots((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
        await sleep(450);
      }

      if (!cancelled) setShowModal(true);
    }

    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleArchive() {
    setVisible(false);
    setTimeout(() => {
      onDone?.();
      router.push("/archive");
    }, 600);
  }

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
                <Image src={tile.logo} alt="" fill style={{ objectFit: "contain" }} />
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "28px 32px",
              maxWidth: 300,
              width: "90%",
              textAlign: "center",
            }}
          >
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 18 }}>
              {(["gold", "silver", "bronze"] as const).map((tier) => (
                <div
                  key={tier}
                  style={{ transform: "scale(0.5)", transformOrigin: "center", margin: "-18px" }}
                >
                  <Medal status={tier} shine={false} ribbon={false} />
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: 30, fontWeight: 600, margin: "0 0 8px" }}>
              No new puzzle today
            </h2>
            <p style={{ fontSize: 25, color: "#666", margin: "0 0 20px", lineHeight: 1.5 }}>
              Puzzles are on{" "}
              <strong style={{ whiteSpace: "nowrap" }}>M / W / F</strong>.<br />
              Play the archive!
            </p>

            <button
              onClick={handleArchive}
              style={{
                width: "100%",
                padding: "12px 0",
                borderRadius: 12,
                backgroundColor: GameConfig.purpleColor,
                color: "#fff",
                fontSize: 20,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              Go to archive
            </button>
          </div>
        </div>
      )}
    </div>
  );
}