// app/contact/page.tsx

import { Metadata } from 'next'
import { GameConfig } from '@/lib/gameConfig'

export const metadata: Metadata = {
  title: 'GSB | Contact',
}

function EmailLink() {
  return (
    <a
      href={`mailto:${GameConfig.gsbEmail}`}
      className="underline hover:opacity-70 transition-opacity"
      style={{ color: GameConfig.purpleColor }}
    >
      {GameConfig.gsbEmail}
    </a>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="w-full max-w-xl mt-10">
      <h2
        className="font-lora text-xl font-bold mb-3"
        style={{ color: GameConfig.purpleColor }}
      >
        {title}
      </h2>
      <div className="font-lora text-base leading-relaxed text-black flex flex-col gap-3">
        {children}
      </div>
    </div>
  )
}

export default function ContactPage() {
  return (
    <div className={`flex flex-col min-h-screen items-center ${GameConfig.pageBackgroundColor} font-lora`}>
      <main className={`flex w-full max-w-3xl flex-col items-center px-8 pt-20 pb-16 ${GameConfig.pageBackgroundColor} min-h-screen`}>
        <h1 className="font-lora text-4xl font-bold text-black tracking-tight mb-2 text-center">
          Get in touch
        </h1>

        <Section title="General Inquiries">
          <p>
            Questions, feedback, or anything else — we&apos;d love to hear
            from you.
          </p>
          <p>
            <EmailLink />
          </p>
        </Section>

        <Section title="Report an Issue">
          <p>
            Found something broken or inaccurate? Email us with as much
            detail as possible — screenshots help.
          </p>
        </Section>
      </main>
    </div>
  )
}