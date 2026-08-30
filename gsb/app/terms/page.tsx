// app/terms/page.tsx

import { Metadata } from 'next'
import { GameConfig } from '@/lib/gameConfig'

export const metadata: Metadata = {
  title: 'GSB | Terms of Use',
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

export default function TermsPage() {
  return (
    <div className={`flex flex-col min-h-screen items-center ${GameConfig.pageBackgroundColor} font-lora`}>
      <main className={`flex w-full max-w-3xl flex-col items-center px-8 pt-20 pb-16 ${GameConfig.pageBackgroundColor} min-h-screen`}>
        <h1 className="font-lora text-4xl font-bold text-black tracking-tight mb-8 text-center">
          Terms of Use
        </h1>

        <Section title="Purpose of the Site">
          <p>
            GSB is a trivia game provided for entertainment purposes. Users
            agree not to attempt to disrupt or interfere with the operation
            of the website.
          </p>
        </Section>

        <Section title="Intellectual Property">
          <p>
            All game design, content, and branding associated with GSB are
            the property of the website owner unless otherwise stated.
          </p>
        </Section>

        <Section title="No Warranty">
          <p>
            GSB is provided &ldquo;as is&rdquo; without warranties of any
            kind. We do not guarantee that the website will always be
            available or error-free.
          </p>
        </Section>

        <Section title="Limitation of Liability">
          <p>
            To the fullest extent permitted by law, GSB and its
            maintainers will not be liable for any damages arising from
            your use of the site, including but not limited to direct,
            indirect, incidental, or consequential damages.
          </p>
        </Section>

        <Section title="Changes to These Terms">
          <p>
            We reserve the right to modify or discontinue any part of the
            website at any time without notice. Continued use of the site
            after changes are posted constitutes your acceptance of the
            revised terms.
          </p>
        </Section>
      </main>
    </div>
  )
}