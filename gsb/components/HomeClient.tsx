// components/HomeClient.tsx

"use client";

import { useRouter } from "next/navigation";
import type { Puzzle } from "@/types";
import Landing from "@/components/Landing";

interface HomeClientProps {
  puzzle: Puzzle | null;
}

export default function HomeClient({ puzzle }: HomeClientProps) {
  const router = useRouter();

  const handlePlay = () => {
    const today =
      puzzle?.date ??
      new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
    router.push(`/puzzles/${today}`);
  };

  return <Landing onPlay={handlePlay} />;
}