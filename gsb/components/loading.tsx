// components/loading.tsx
"use client";

import { useState } from "react";
import SplashScreen from "@/components/SplashScreen";

export default function Loading() {
  const [done, setDone] = useState(false);

  if (done) return null;

  return <SplashScreen onDone={() => setDone(true)} />;
}