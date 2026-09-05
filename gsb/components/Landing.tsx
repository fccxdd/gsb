// components/Landing.tsx

"use client";

import { useState, Fragment, ReactNode } from "react";
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

const SOURCES = [
  {
    name: "SEC EDGAR",
    description:
      "The official U.S. Securities and Exchange Commission database that provides free, direct access to official annual reports.",
  },
  {
    name: "Macrotrends",
    description:
      "a research platform that provides comprehensive historical data covering financial markets.",
  },
  {
    name: "Corporate websites",
    description: "that host direct, unfiltered earnings releases, and annual reports.",
  },
  {
    name: "Roic.ai",
    description: "a research platform to access reliable and concise financial information about any company.",
  },
  {
    name: "Microtrends",
    description: "a research platform with company financial data dating back to 1995.",
  },
];

const FAQS: { question: string; answer: ReactNode }[] = [
  {
    question: "What is GSB?",
    answer:
      "GSB is a business trivia game where players rank 4 companies based on revenue generated in a single year (highest to lowest).",
  },
  {
    question: "Is GSB daily?",
    answer: "No, new GSB puzzles are available Mondays, Wednesdays, and Fridays.",
  },
  {
    question: "Is GSB free?",
    answer: "Yes, GSB is free to play and can be played on your browser, or mobile device.",
  },
  {
    question: "What companies are selected?",
    answer:
      "A majority of the companies selected are public companies who have fully disclosed revenues and earning history. On the occasion a public company isn\u2019t selected, we will select an organization that has publicized their revenues in one form or another.",
  },
  {
    question: "What are your sources for revenue figures?",
    answer: (
      <div className="flex flex-col gap-4">
        <p>We use several sources to verify revenue figures, these include:</p>
        {SOURCES.map((source) => (
          <p key={source.name}>
            <span className="font-bold">{source.name}:</span> {source.description}
          </p>
        ))}
      </div>
    ),
  },
  {
    question: "Can I play past puzzles?",
    answer: "Yes, you can play past puzzles in the archive.",
  },
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

function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
	<div className="border-b border-black/20">
	  <button
		type="button"
		onClick={onToggle}
		aria-expanded={isOpen}
		className="w-full flex items-center justify-between gap-4 py-4 text-left"
	  >
		<span className="font-lora text-base font-bold text-black">{question}</span>
		<span
		  className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-white text-sm font-lora font-bold"
		  style={{ backgroundColor: GameConfig.purpleColor }}
		>
		  {isOpen ? "\u2212" : "+"}
		</span>
	  </button>
	  <div
		className="grid transition-all duration-300 ease-in-out"
		style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
	  >
		<div className="overflow-hidden">
		  <div className="font-lora text-base leading-relaxed text-black pb-4 pr-8">{answer}</div>
		</div>
	  </div>
	</div>
  );
}

export default function Landing({ onPlay }: LandingProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleFaqToggle = (i: number) => {
	setOpenFaqIndex((prev) => (prev === i ? null : i));
  };

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

	  <p className="mt-8 text-lg font-lora font-bold text-black text-center">
		Rank 4 companies based on revenue
		<br />
		<span className={GameConfig.puzzleTextColors.gold}>Gold</span>{" "}
		<span className={GameConfig.puzzleTextColors.silver}>Silver</span>{" "}
		<span className={GameConfig.puzzleTextColors.bronze}>Bronze</span>
	  </p>

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
			  "Read the Headlines from that year to get a glimpse of the industry at that time.",
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

		<SubSection title="FAQ">
		  <div>
			{FAQS.map((faq, i) => (
			  <AccordionItem
				key={i}
				question={faq.question}
				answer={faq.answer}
				isOpen={openFaqIndex === i}
				onToggle={() => handleFaqToggle(i)}
			  />
			))}
		  </div>
		</SubSection>
	  </Section>
	</div>
  );
}