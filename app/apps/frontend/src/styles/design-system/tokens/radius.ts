/**
 * Border Radius Tokens
 * Baseado no global.css do projeto
 */

export const radius = {
  none: '0',
  xs: '2px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
} as const;

export type RadiusToken = keyof typeof radius;

export default radius;

