import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom DMS Color Palette
        primary: {
          DEFAULT: '#0B2F4A',
          blue: '#0B2F4A',
        },
        secondary: {
          DEFAULT: '#1F4E6D',
          blue: '#1F4E6D',
        },
        accent: {
          DEFAULT: '#F2B705',
          gold: '#F2B705',
        },
        background: {
          DEFAULT: '#F5F7FA',
          light: '#F5F7FA',
        },
        text: {
          primary: '#1A1A1A',
          secondary: '#6B7280',
        },
        // Additional utility colors
        border: '#E5E7EB',
        input: '#E5E7EB',
        ring: '#0B2F4A',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Noto Sans Lao', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
