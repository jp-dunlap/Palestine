import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx,mdx}',
    './content/**/*.{md,mdx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'var(--font-inter)',
          'system-ui',
          '-apple-system',
          "'Segoe UI'",
          'Roboto',
          'Arial',
          'sans-serif',
        ],
        arabic: [
          'var(--font-naskh)',
          "'Noto Naskh Arabic'",
          "'Amiri'",
          "'Scheherazade New'",
          'serif',
        ],
      },
    },
  },
  plugins: []
};

export default config;
