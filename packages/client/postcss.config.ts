import type { Config } from 'postcss';

export default {
  plugins: {
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
  },
} satisfies Config;
