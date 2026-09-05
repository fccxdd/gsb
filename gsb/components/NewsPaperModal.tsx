// gsb/components/NewsPaperModal.tsx

"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { IoChevronBack, IoChevronForward, IoClose } from "react-icons/io5";
import { Company } from "@/types";

interface NewspaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
}

const SWIPE_THRESHOLD = 50; // minimum px horizontal movement to count as a swipe
const SLIDE_TRANSITION = "transform 0.38s cubic-bezier(0.16, 0.8, 0.2, 1)";

export default function NewspaperModal({ isOpen, onClose, companies }: NewspaperModalProps) {
  const [current, setCurrent] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingDirection, setPendingDirection] = useState<"next" | "prev" | null>(null);
  const [suppressTransition, setSuppressTransition] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    function measure() {
      if (trackRef.current) setContainerWidth(trackRef.current.offsetWidth);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [isOpen]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, current]);

  // Once we suppress the transition to make the swap invisible, flip it back
  // on for the *next* frame so future drags/swipes animate normally again.
  useEffect(() => {
    if (!suppressTransition) return;
    const id = requestAnimationFrame(() => setSuppressTransition(false));
    return () => cancelAnimationFrame(id);
  }, [suppressTransition]);

    function next() {
    setCurrent((c) => (c + 1) % companies.length);
    }

    function prev() {
    setCurrent((c) => (c - 1 + companies.length) % companies.length);
    }

  function handleTouchStart(e: React.TouchEvent) {
    // Ignore a new touch while a swipe is still settling into place
    if (pendingDirection !== null) return;
    touchStartX.current = e.touches[0].clientX;
    setIsDragging(true);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.touches[0].clientX - touchStartX.current;
    setDragOffset(delta);
  }

  function handleTouchEnd() {
    if (touchStartX.current === null) return;
    touchStartX.current = null;
    setIsDragging(false);

    if (companies.length > 1 && dragOffset > SWIPE_THRESHOLD) {
      // Keep gliding right in the direction already being dragged
      setPendingDirection("prev");
      setDragOffset(containerWidth || 1);
    } else if (companies.length > 1 && dragOffset < -SWIPE_THRESHOLD) {
      // Keep gliding left in the direction already being dragged
      setPendingDirection("next");
      setDragOffset(-(containerWidth || 1));
    } else {
      // Didn't clear the threshold — ease gently back to center
      setPendingDirection(null);
      setDragOffset(0);
    }
  }

  // Fires once the "current" slide finishes gliding fully off-screen. At that
  // exact instant we swap the index and reset the offset to 0 — but we also
  // suppress the transition for that one swap, so the reset is instant
  // instead of animating back in a second, separate motion.
  function handleSlideTransitionEnd() {
    if (pendingDirection === null) return;
    setSuppressTransition(true);
    if (pendingDirection === "next") next();
    if (pendingDirection === "prev") prev();
    setPendingDirection(null);
    setDragOffset(0);
  }

  if (!isOpen) return null;

  const current_company = companies[current];
  const prev_company = companies[(current - 1 + companies.length) % companies.length];
  const next_company = companies[(current + 1) % companies.length];

  const slideStyle = (base: number): React.CSSProperties => ({
    transform: `translateX(${base * containerWidth + dragOffset}px)`,
    transition: isDragging || suppressTransition ? "none" : SLIDE_TRANSITION,
  });

return (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    onClick={onClose}
  >
    {/* Chevrons on the dark overlay — hidden on mobile, swipe handles navigation there */}
    {companies.length > 1 && (
      <>
        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          className="hidden sm:block absolute left-4 bg-white/20 hover:bg-white/40 rounded-full p-3 text-white transition cursor-pointer z-10"
        >
          <IoChevronBack size={24} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          className="hidden sm:block absolute right-4 bg-white/20 hover:bg-white/40 rounded-full p-3 text-white transition cursor-pointer z-10"
        >
          <IoChevronForward size={24} />
        </button>
      </>
    )}

    <div
      className="relative w-full max-w-3xl mx-4 sm:mx-16 rounded-lg overflow-hidden touch-pan-y"
      onClick={(e) => e.stopPropagation()}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12">
            <Image
              src={current_company.logoSrc}
              alt={current_company.name}
              fill
              className="object-contain object-left"
            />
          </div>
          <span className="text-xl font-lora font-semibold text-white tracking-wide">
            | {current_company.name}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <IoClose size={22} />
        </button>
      </div>

      {/* Image track — prev/current/next sit side by side and slide together,
          so the next or previous clipping peeks in as you drag. */}
      <div ref={trackRef} className="relative flex justify-center px-4 pb-2 overflow-hidden">
        <div className="relative w-full flex justify-center" style={{ maxHeight: "72vh" }}>
          {/* Spacer to preserve layout height based on the current image's aspect ratio */}
          <Image
            src={current_company.newspaperClipping}
            alt=""
            width={1080}
            height={1310}
            aria-hidden
            className="h-auto w-auto max-w-full max-h-[72vh] invisible"
          />

          {companies.length > 1 && (
            <div className="absolute inset-0 flex justify-center" style={slideStyle(-1)}>
              <Image
                src={prev_company.newspaperClipping}
                alt={`${prev_company.name} newspaper clipping`}
                width={1080}
                height={1310}
                sizes="(max-width: 768px) 90vw, 768px"
                className="h-full w-auto max-w-full object-contain"
              />
            </div>
          )}

          <div
            className="absolute inset-0 flex justify-center"
            style={slideStyle(0)}
            onTransitionEnd={handleSlideTransitionEnd}
          >
            <Image
              src={current_company.newspaperClipping}
              alt={`${current_company.name} newspaper clipping`}
              width={1080}
              height={1310}
              priority
              sizes="(max-width: 768px) 90vw, 768px"
              className="h-full w-auto max-w-full object-contain"
            />
          </div>

          {companies.length > 1 && (
            <div className="absolute inset-0 flex justify-center" style={slideStyle(1)}>
              <Image
                src={next_company.newspaperClipping}
                alt={`${next_company.name} newspaper clipping`}
                width={1080}
                height={1310}
                sizes="(max-width: 768px) 90vw, 768px"
                className="h-full w-auto max-w-full object-contain"
              />
            </div>
          )}
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 py-4">
        {companies.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); }}
            className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
              i === current ? "bg-purple-300" : "bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  </div>
);
}