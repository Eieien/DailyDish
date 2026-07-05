/**
 * Central design tokens for DailyDish.
 *
 * Use these when you need the raw value in JS/TS (icon colors, StyleSheet,
 * gradients, etc.). For layout/styling prefer the NativeWind classes that map
 * to the same tokens (e.g. `bg-primary`, `text-secondary`, `font-urbanist`).
 */

export const colors = {
  primary: '#C85A3A',
  secondary: '#7A2E3F',
  accent: '#D4A844',
  neutral: '#FAF7F4',

  // Supporting neutrals derived for text / borders / surfaces.
  ink: '#2B2320',
  muted: '#8A7F79',
  border: '#EFE7E1',
  surface: '#FFFFFF',

  // Macro progress bars.
  proteinBar: '#7A2E3F',
  fatBar: '#D4A844',
  carbBar: '#C85A3A',
} as const;

/**
 * Font family keys map 1:1 to the fonts loaded in `app/_layout.tsx` and to the
 * `fontFamily` entries in `tailwind.config.js`.
 */
export const fonts = {
  regular: 'Urbanist_400Regular',
  medium: 'Urbanist_500Medium',
  semibold: 'Urbanist_600SemiBold',
  bold: 'Urbanist_700Bold',
  extrabold: 'Urbanist_800ExtraBold',
} as const;

export type ColorToken = keyof typeof colors;
export type FontToken = keyof typeof fonts;
