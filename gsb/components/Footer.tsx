// components/Footer.tsx

import Link from "next/link";
import { GameConfig } from "@/lib/gameConfig";

export default function Footer() {
  return (
    <footer className={`w-full flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-1 px-4 sm:px-6 py-3 border-t border-white/10 ${GameConfig.pageBackgroundColor} text-[13px] sm:text-[15px] text-black font-lora`}>

      <p className="whitespace-nowrap font-lora"> © {new Date().getFullYear()} <Link href="/" className="font-lora hover:text-[#4C4CDB] transition-colors">GSB</Link></p>
      <span className="hidden sm:block w-px h-3.5 bg-black shrink-0"/>
      <Link href="/#about" className="font-lora hover:text-[#4C4CDB] transition-colors">About</Link>
      <Link href="/privacy" className="font-lora hover:text-[#4C4CDB] transition-colors">Privacy</Link>
      <Link href="/terms" className="font-lora hover:text-[#4C4CDB] transition-colors">Terms</Link>
      <Link href="/contact" className="font-lora hover:text-[#4C4CDB] transition-colors">Contact</Link>
    </footer>
  );
}