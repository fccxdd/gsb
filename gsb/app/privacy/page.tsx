// app/privacy/page.tsx

import { Metadata } from 'next'
import { GameConfig } from '@/lib/gameConfig'

export const metadata: Metadata = {
  title: 'GSB | Privacy Policy',
}

const COLLECTED_INFO = [
  'Browser type',
  'Device type',
  'Pages visited',
  'Time spent on the website',
  'Approximate location based on IP address',
]

const COOKIE_USES = [
  'Improve functionality',
  'Analyze traffic',
  'Support advertising services',
]

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

export default function PrivacyPage() {

  return (
    <div className={`flex flex-col min-h-screen items-center ${GameConfig.pageBackgroundColor} font-lora`}>
      <main className={`flex w-full max-w-3xl flex-col items-center px-8 pt-20 pb-16 ${GameConfig.pageBackgroundColor} min-h-screen`}>
        <h1 className="font-lora text-4xl font-bold text-black tracking-tight mb-2 text-center">
          Privacy Policy
        </h1>

        <p className="font-lora text-sm italic text-slate-500 mb-8 text-center">
          As of August 31, 2026
        </p>

        <p className="font-lora text-base leading-relaxed text-black text-center max-w-xl">
          GSB respects your privacy. This policy explains what information
          may be collected when you use playgsb.com and how it is used.
        </p>

        <Section title="Information We Collect">
          <p>
            When you visit this website, certain non-personal information
            may be collected automatically. This may include:
          </p>
          <ul className="list-disc list-inside flex flex-col gap-1 ml-1">
            {COLLECTED_INFO.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            This information is used to improve the performance and
            usability of the website.
          </p>
        </Section>

        <Section title="Google Analytics">
          <p>
            This website uses Google Analytics, a web analytics service
            provided by Google.
          </p>
          <p>
            Google Analytics uses cookies and similar technologies to
            collect information about how visitors use the site. This data
            helps us understand usage patterns and improve the website.
          </p>
        </Section>

        <Section title="Advertising">
          <p>
            This website may display advertisements through Google AdSense.
          </p>
          <p>
            Third-party vendors, including Google, use cookies to serve ads
            based on a user&apos;s prior visits to this website or other
            websites.
          </p>
          <p>
            Google&apos;s use of advertising cookies enables it and its
            partners to serve ads to users based on their visit to this
            site and/or other sites on the Internet.
          </p>
          <p>
            Users may opt out of personalized advertising by visiting{' '}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-70 transition-opacity"
              style={{ color: GameConfig.purpleColor }}
            >
              Google Ads Settings
            </a>
            .
          </p>
        </Section>

        <Section title="Cookies">
          <p>
            Cookies are small data files stored on your device. This
            website may use cookies to:
          </p>
          <ul className="list-disc list-inside flex flex-col gap-1 ml-1">
            {COOKIE_USES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>You can disable cookies through your browser settings if you prefer.</p>
        </Section>

        <Section title="Third-Party Services">
          <p>
            This website may use third-party services that collect and
            process data according to their own privacy policies.
          </p>
        </Section>

        <Section title="Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. Updates
            will be posted on this page.
          </p>
        </Section>
      </main>
    </div>
  )
}