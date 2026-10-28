/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep, elegant Navy Blue palette
        navy: {
          50: '#f0f4f9',
          100: '#dbe5f2',
          200: '#bbd0e6',
          300: '#8db3d5',
          400: '#5a91bf',
          500: '#3974a7',
          600: '#285b8c',
          700: '#1e4670',
          800: '#153354', // rich royal navy
          850: '#112945',
          900: '#0c1e33', // deep luxury navy blue
          950: '#071220', // midnight navy
        },
        // Warm, creamy Beige / Sand palette
        beige: {
          50: '#fdfbf7',  // ivory highlight
          100: '#f7f2ea', // soft warm beige page background
          150: '#f2eae0', // card surface
          200: '#e8dbcb', // border & divider
          300: '#d7c2a9', // subtle accent
          400: '#c5a784',
          500: '#b18c61', // warm caramel gold accent
          600: '#967246',
          700: '#795834',
          800: '#5f4428',
          900: '#48331d',
        },
        // Legacy pharma fallback mapped to navy & beige
        pharma: {
          50: '#f0f4f9',
          100: '#dbe5f2',
          200: '#bbd0e6',
          300: '#8db3d5',
          400: '#5a91bf',
          500: '#285b8c',
          600: '#1e4670',
          700: '#153354',
          800: '#0c1e33',
          900: '#071220',
        }
      }
    },
  },
  plugins: [],
}
