// components/Footer.tsx

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full flex items-center justify-center gap-4 px-6 py-3 border-t border-white/10 text-[11px] text-white/40"
      style={{ fontFamily: "'InriaSerif', serif" }}>
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5" style={{ background: '#FFBF00' }} />
        <span className="w-2.5 h-2.5" style={{ background: '#CCCCCC'}} />
        <span className="w-2.5 h-2.5" style={{ background: '#CD7F32'}} />
        <span className="w-2.5 h-2.5" style={{ background: '#FFFFFF' }} />

      </span>
      <p className="whitespace-nowrap">© {new Date().getFullYear()} <Link href="/" className="hover:text-white/70 transition-colors">GSB</Link></p>
      <span className="w-px h-3.5" style={{ background: '#FFFFFF' }} />
      <Link href="/about" className="hover:text-white/70 transition-colors">About</Link>
      <Link href="/privacy" className="hover:text-white/70 transition-colors">Privacy</Link>
      <Link href="/terms" className="hover:text-white/70 transition-colors">Terms</Link>
      <Link href="/contact" className="hover:text-white/70 transition-colors">Contact</Link>
    </footer>
  );
}