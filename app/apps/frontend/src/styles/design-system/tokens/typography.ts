/**
 * Typography Tokens
 * Baseado no global.css do projeto
 */

export const fontSize = {
  xs: '0.75rem',      // 12px
  sm: '0.875rem',     // 14px
  base: '1rem',       // 16px
  md: '1.125rem',     // 18px
  lg: '1.25rem',      // 20px
  xl: '1.25em',       // h5
  '2xl': '1.563em',   // h4
  '3xl': '1.953em',   // h3
  '4xl': '2.441em',   // h2
  '5xl': '3.052em',   // h1
} as const;

export const lineHeight = {
  none: '1',
  tight: '1.2',       // headings
  normal: '1.5',
  relaxed: '1.7',     // body
  loose: '2',
} as const;

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const fontFamily = {
  sans: '"Atkinson", sans-serif',
  mono: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
} as const;

export type FontSizeToken = keyof typeof fontSize;
export type LineHeightToken = keyof typeof lineHeight;
export type FontWeightToken = keyof typeof fontWeight;
export type FontFamilyToken = keyof typeof fontFamily;

export const typography = {
  fontSize,
  lineHeight,
  fontWeight,
  fontFamily,
} as const;

export default typography;

