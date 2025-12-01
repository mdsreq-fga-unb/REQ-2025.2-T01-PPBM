/**
 * Spacing Tokens (padding, margin, gap)
 * Baseado no global.css do projeto
 */

export const spacing = {
  none: '0',
  xs: '0.25rem',      // 4px
  sm: '0.5rem',       // 8px
  md: '1rem',         // 16px
  lg: '1.5rem',       // 24px
  xl: '2rem',         // 32px
  '2xl': '2.5rem',    // 40px
  '3xl': '3rem',      // 48px
  '4xl': '4rem',      // 64px
  '5xl': '5rem',      // 80px
  '6xl': '6rem',      // 96px
} as const;

export type SpacingToken = keyof typeof spacing;

export default spacing;

