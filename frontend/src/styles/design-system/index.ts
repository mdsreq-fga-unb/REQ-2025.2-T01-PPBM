/**
 * Design System - Ponto de entrada principal
 * 
 * Este arquivo re-exporta todos os tokens e componentes do design system.
 * 
 * Uso:
 * import { radius, spacing, fontSize } from '@/styles/design-system';
 * 
 * Estrutura:
 * - tokens/     - Tokens de design (radius, spacing, typography)
 * - components/ - Componentes reutilizáveis (em desenvolvimento)
 */

// Re-exporta todos os tokens
export {
  radius,
  spacing,
  typography,
  fontSize,
  lineHeight,
  fontWeight,
  fontFamily,
  tokens,
} from './tokens';

export type {
  RadiusToken,
  SpacingToken,
  FontSizeToken,
  LineHeightToken,
  FontWeightToken,
  FontFamilyToken,
} from './tokens';

