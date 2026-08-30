// components/loading.tsx
"use client";

import { useState } from "react";
import SplashScreen from "@/components/SplashScreen";

interface LoadingProps {
  onDone?: () => void;
}

export default function Loading({ onDone }: LoadingProps) {
  const [done, setDone] = useState(false);

  if (done) return null;

  return (
    <SplashScreen
      onDone={() => {
        setDone(true);
        onDone?.();
      }}
    />
  );
}