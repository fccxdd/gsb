import type { Config } from 'tailwindcss'

const config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'bg-[#FFBF00]',
    'bg-[#CCCCCC]',
    'bg-[#CD7F32]',
    'bg-[#FFFFFF]',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config