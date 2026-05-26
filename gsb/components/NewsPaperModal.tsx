// gsb/components/NewsPaperModal.tsx

"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { IoChevronBack, IoChevronForward, IoClose } from "react-icons/io5";
import { Company } from "@/types";

interface NewspaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
}

export default function NewspaperModal({ isOpen, onClose, companies }: NewspaperModalProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, current]);

    function playSound() {
    const audio = new Audio("/rustling_newspaper.mp3");
    audio.play();
}

    function next() {
    playSound();
    setCurrent((c) => (c + 1) % companies.length);
    }

    function prev() {
    playSound();
    setCurrent((c) => (c - 1 + companies.length) % companies.length);
    }

  if (!isOpen) return null;

  const current_company = companies[current];

return (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    onClick={onClose}
  >
    {/* Chevrons on the dark overlay */}
    {companies.length > 1 && (
      <>
        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          className="absolute left-4 bg-white/20 hover:bg-white/40 rounded-full p-3 text-white transition cursor-pointer z-10"
        >
          <IoChevronBack size={24} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          className="absolute right-4 bg-white/20 hover:bg-white/40 rounded-full p-3 text-white transition cursor-pointer z-10"
        >
          <IoChevronForward size={24} />
        </button>
      </>
    )}

    <div
      className="relative w-full max-w-2xl mx-16 bg-white rounded-lg overflow-hidden shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12">
            <Image
              src={current_company.logoSrc}
              alt={current_company.name}
              fill
              className="object-contain object-left"
            />
          </div>
          <span className="text-xl font-semibold text-zinc-600 tracking-wide">
            | {current_company.name}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
        >
          <IoClose size={22} />
        </button>
      </div>

      {/* Image */}
      <div className="relative w-full h-[60vh]">
        <Image
          src={current_company.newspaperClipping}
          alt={`${current_company.name} newspaper clipping`}
          fill
          priority
          className="object-contain p-4"
        />
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 py-4">
        {companies.map((_, i) => (
          <button
            key={i}
            onClick={() => { playSound(); setCurrent(i); }}
            className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
              i === current ? "bg-zinc-700" : "bg-zinc-300"
            }`}
          />
        ))}
      </div>
    </div>
  </div>
);
}