/**
 * Design System Tokens
 * Sistema de design baseado no global.css do projeto
 * 
 * Uso:
 * import { radius, spacing, typography } from '@/styles/design-system/tokens';
 * 
 * Exemplo:
 * const buttonStyles = {
 *   borderRadius: radius.sm,
 *   padding: `${spacing.sm} ${spacing.md}`,
 *   fontSize: typography.fontSize.base,
 * };
 */

export { radius } from './radius';
export type { RadiusToken } from './radius';

export { spacing } from './spacing';
export type { SpacingToken } from './spacing';

export {
  typography,
  fontSize,
  lineHeight,
  fontWeight,
  fontFamily,
} from './typography';
export type {
  FontSizeToken,
  LineHeightToken,
  FontWeightToken,
  FontFamilyToken,
} from './typography';

// Exportação consolidada para uso conveniente
import radiusModule from './radius';
import spacingModule from './spacing';
import typographyModule from './typography';

export const tokens = {
  radius: radiusModule,
  spacing: spacingModule,
  typography: typographyModule,
};

