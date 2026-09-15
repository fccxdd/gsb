// components/HomeClient.tsx

"use client";

import { useRouter } from "next/navigation";
import Landing from "@/components/Landing";

export default function HomeClient() {
  const router = useRouter();

  const handlePlay = () => {
    // Computed fresh on click rather than trusting any server/build-time
    // value — this page is statically exported and only rebuilt on
    // puzzle days, so a build-time "today" goes stale the very next day.
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
    router.push(`/puzzles/${today}`);
  };

  return <Landing onPlay={handlePlay} />;
}
