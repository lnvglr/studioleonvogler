/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./content/**/*.{md,mdx}",
    "./utils/**/*.{js,ts}",
  ],
  theme: {
    fontFamily: {
      sans: ['Gramatika', 'Heebo', 'system-ui', 'sans-serif'],
      body: ['Gramatika', 'Heebo', 'system-ui', 'sans-serif']
    },
    extend: {
      colors: {
        green: {
          50: '#f0f7f2',
          100: '#dceee1',
          200: '#bcddc5',
          300: '#8fc4a0',
          400: '#5ea576',
          500: '#396b3a',
          600: '#2d5630',
          700: '#254528',
          800: '#1f3821',
          900: '#1a2f1c',
        },
      },
    },
  },
  plugins: [],
}

