// components/Landing.tsx

"use client";

import Image from "next/image";
import { GameConfig } from "@/lib/gameConfig";
import TitleCoins from "@/components/TitleCoins";
import Link from "next/link";

const GRID_TILES = [
  { color: GameConfig.puzzleBackgroundHex.gold,   logo: "/splash/tech.png",          alt: "Tech" },
  { color: GameConfig.puzzleBackgroundHex.silver, logo: "/splash/food.png",          alt: "Food" },
  { color: GameConfig.puzzleBackgroundHex.bronze, logo: "/splash/auto.png",          alt: "Auto" },
  { color: GameConfig.puzzleBackgroundHex.fourth, logo: "/splash/entertainment.png", alt: "Entertainment" },
];

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
  { href: "#terms", label: "Terms" },
  { href: "#privacy", label: "Privacy Policy" },
];

interface LandingProps {
  onPlay: () => void;
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
	<section id={id} className="w-full max-w-xl mt-16 scroll-mt-24">
	  <h2
		className="font-lora text-3xl font-bold mb-6 text-center"
		style={{ color: GameConfig.purpleColor }}
	  >
		{title}
	  </h2>
	  <div className="font-lora text-base leading-relaxed text-black flex flex-col gap-3">
		{children}
	  </div>
	</section>
  );
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
	<div className="w-full mt-8">
	  <h3 className="font-lora text-xl font-bold mb-3 text-black">{title}</h3>
	  <div className="font-lora text-base leading-relaxed text-black flex flex-col gap-3">
		{children}
	  </div>
	</div>
  );
}

export default function Landing({ onPlay }: LandingProps) {
  return (
	<div className={`flex flex-col min-h-screen items-center ${GameConfig.pageBackgroundColor} font-lora px-6 py-10`}>
	  {/* Hero */}
	  <TitleCoins />

	  <div className="grid grid-cols-2 gap-3 mt-10" style={{ width: 252 }}>
		{GRID_TILES.map((tile) => (
		  <div
			key={tile.alt}
			className="flex items-center justify-center rounded-2xl border border-black/5"
			style={{ width: 120, height: 120, backgroundColor: tile.color }}
		  >
			<div className="relative w-16 h-16">
			  <Image src={tile.logo} alt={tile.alt} fill style={{ objectFit: "contain" }} />
			</div>
		  </div>
		))}
	  </div>

	  <button
		onClick={onPlay}
		className="mt-10 px-12 py-3 rounded-full text-white font-lora font-bold text-lg cursor-pointer hover:opacity-90 transition-opacity"
		style={{ backgroundColor: GameConfig.purpleColor }}
	  >
		Play
	  </button>
	  
	  <Link
	  	href="/archive"
		className="mt-4 px-12 py-3 rounded-full border-2 font-lora font-bold text-lg text-center cursor-pointer hover:bg-black/5 transition-colors"
		style={{ borderColor: GameConfig.purpleColor, color: GameConfig.purpleColor }}
		>
		Archive
		</Link>

	  <p className="mt-8 font-lora font-bold text-black text-center">
		Rank 4 companies based on revenue
		<br />
		<span className={GameConfig.puzzleTextColors.gold}>Gold</span>{" "}
		<span className={GameConfig.puzzleTextColors.silver}>Silver</span>{" "}
		<span className={GameConfig.puzzleTextColors.bronze}>Bronze</span>
	  </p>


	  {/* About */}
	  <Section id="about" title="About GSB">
		<p className="text-center">
		  GSB is a business trivia game where you rank 4 companies based on
		  revenue generated in a single year (highest to lowest).
		</p>
		<p className="text-center">Read the news articles to assist you as you solve.</p>

		<SubSection title="How to Play">
		  <ul className="flex flex-col gap-3">
			{[
			  "Select the companies you think generated the most revenue from highest to lowest (Gold Silver Bronze).",
			  "Read the Headlines from X00Y to get a glimpse of the industry at that time.",
			  "You have 3 chances to solve the puzzle.",
			  "Tap Submit to check if you\u2019re correct.",
			].map((step, i) => (
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
		</SubSection>
	  </Section>
	</div>
  );
}