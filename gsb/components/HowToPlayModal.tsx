// components/HowToPlayModal.tsx

"use client";

import { IoClose } from "react-icons/io5";
import { GameConfig } from "@/lib/gameConfig";
import { HOW_TO_PLAY_STEPS } from "@/lib/howToPlaySteps";

interface HowToPlayModalProps {
  onClose: () => void;
}

export default function HowToPlayModal({ onClose }: HowToPlayModalProps) {
  return (
    // Backdrop — clicking it closes the modal.
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      {/* Stop clicks inside the card from reaching the backdrop. */}
      <div
        className="relative bg-white rounded-2xl px-8 py-8 max-w-sm w-full flex flex-col items-center gap-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
        >
          <IoClose className="text-2xl" />
        </button>

        <h2 className="text-2xl font-bold font-lora text-zinc-800 text-center">
          How to Play
        </h2>

        <ul className="flex flex-col gap-3 font-lora text-base text-black w-full">
          {HOW_TO_PLAY_STEPS.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-white text-sm font-lora font-bold mt-0.5"
                style={{ backgroundColor: GameConfig.purpleColor }}
              >
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
