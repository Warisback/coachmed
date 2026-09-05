import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FCFBF8',
        foil: '#E7E4DC',
        ink: '#16191C',
        slate: '#5D6670',
        taken: '#2E6B4F',
        due: '#C8892B',
        missed: '#A93F26',
        clinical: '#F5F7F8',
        rule: '#DDE2E4',
      },
      fontFamily: {
        sans: ['var(--font-instrument)', 'system-ui', 'sans-serif'],
        gp: ['var(--font-inter-tight)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
