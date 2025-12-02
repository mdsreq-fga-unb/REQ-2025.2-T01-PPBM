/**
 * Exemplos de uso do Design System
 * Este arquivo demonstra como usar os tokens em diferentes contextos
 */

import { radius, spacing, fontSize, lineHeight, fontWeight } from './index';

// ========================================
// Exemplo 1: Estilos de botão
// ========================================

export const buttonStyles = {
  primary: {
    borderRadius: radius.sm,
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.normal,
  },
  secondary: {
    borderRadius: radius.sm,
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
  },
  large: {
    borderRadius: radius.md,
    padding: `${spacing.md} ${spacing.lg}`,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.normal,
  },
} as const;

// ========================================
// Exemplo 2: Estilos de card
// ========================================

export const cardStyles = {
  base: {
    borderRadius: radius.sm,
    padding: spacing.lg,
  },
  compact: {
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  large: {
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
} as const;

// ========================================
// Exemplo 3: Tipografia
// ========================================

export const typographyStyles = {
  h1: {
    fontSize: fontSize['5xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    marginBottom: spacing.md,
  },
  h2: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    marginBottom: spacing.md,
  },
  h3: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    marginBottom: spacing.md,
  },
  body: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.relaxed,
    marginBottom: spacing.md,
  },
  small: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
  },
} as const;

// ========================================
// Exemplo 4: Layout spacing
// ========================================

export const layoutStyles = {
  container: {
    padding: `${spacing.md} ${spacing.lg}`,
  },
  section: {
    marginBottom: spacing['3xl'],
  },
  stack: {
    gap: spacing.md,
  },
  grid: {
    gap: spacing.lg,
  },
} as const;

// ========================================
// Exemplo 5: Componentes com múltiplos tokens
// ========================================

export const componentStyles = {
  input: {
    borderRadius: radius.sm,
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: fontSize.base,
    lineHeight: lineHeight.normal,
  },
  badge: {
    borderRadius: radius.full,
    padding: `${spacing.xs} ${spacing.sm}`,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.none,
  },
  modal: {
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  dropdown: {
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  avatar: {
    borderRadius: radius.full,
  },
} as const;

// ========================================
// Exemplo 6: Função helper para criar espaçamentos compostos
// ========================================

/**
 * Cria uma string de padding com valores do token spacing
 * @param top - Token de spacing para top
 * @param right - Token de spacing para right
 * @param bottom - Token de spacing para bottom (opcional, usa top se não fornecido)
 * @param left - Token de spacing para left (opcional, usa right se não fornecido)
 */
export function createPadding(
  top: keyof typeof spacing,
  right: keyof typeof spacing,
  bottom?: keyof typeof spacing,
  left?: keyof typeof spacing
): string {
  const b = bottom !== undefined ? spacing[bottom] : spacing[top];
  const l = left !== undefined ? spacing[left] : spacing[right];
  return `${spacing[top]} ${spacing[right]} ${b} ${l}`;
}

// Uso: createPadding('md', 'lg') -> "1rem 1.5rem 1rem 1.5rem"
// Uso: createPadding('sm', 'md', 'md') -> "0.5rem 1rem 1rem 1rem"

