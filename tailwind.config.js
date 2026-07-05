/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand palette (see constants/theme.ts for the JS/TS equivalents).
        primary: '#C85A3A',
        secondary: '#7A2E3F',
        accent: '#D4A844',
        neutral: '#FAF7F4',

        // Supporting neutrals for text / borders / surfaces.
        ink: '#2B2320',
        muted: '#8A7F79',
        line: '#EFE7E1',
        surface: '#FFFFFF',
      },
      fontFamily: {
        // Weight-specific families load in app/_layout.tsx via useFonts.
        urbanist: ['Urbanist_400Regular'],
        'urbanist-medium': ['Urbanist_500Medium'],
        'urbanist-semibold': ['Urbanist_600SemiBold'],
        'urbanist-bold': ['Urbanist_700Bold'],
        'urbanist-extrabold': ['Urbanist_800ExtraBold'],
      },
    },
  },
  plugins: [],
};
