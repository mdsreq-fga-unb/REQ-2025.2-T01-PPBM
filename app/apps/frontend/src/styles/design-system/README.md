# Design System - Tokens

Sistema de design baseado no `global.css` do projeto, com tokens TypeScript e CSS para consistência visual.

## 📁 Estrutura

```
design-system/
├── tokens/          # Tokens de design
│   ├── radius.ts        # Tokens de border-radius
│   ├── spacing.ts       # Tokens de spacing (padding, margin, gap)
│   ├── typography.ts    # Tokens de tipografia
│   ├── index.ts         # Exportações dos tokens
│   ├── example.ts       # Exemplos de uso em TypeScript
│   └── example.svelte   # Exemplos de uso em Svelte
├── components/      # Componentes reutilizáveis (em desenvolvimento)
├── tokens.css       # Custom properties CSS
├── index.ts         # Exportações principais
└── README.md        # Esta documentação
```

## 🎨 Uso

### TypeScript/JavaScript

```typescript
import { radius, spacing, fontSize } from '@/styles/design-system';

// Exemplo em um componente
const styles = {
  borderRadius: radius.sm,
  padding: `${spacing.sm} ${spacing.md}`,
  fontSize: fontSize.base,
};
```

### CSS (Custom Properties)

Primeiro, importe o arquivo de tokens no seu `global.css`:

```css
@import './design-system/tokens.css';
```

Depois use as custom properties:

```css
.card {
  border-radius: var(--radius-sm);
  padding: var(--spacing-md);
  font-size: var(--font-size-base);
}
```

### Tailwind CSS

Os tokens já estão integrados no `tailwind.config.mjs`. Use as classes normalmente:

```html
<div class="rounded-sm p-md text-base">
  Conteúdo estilizado com tokens
</div>
```

## 📐 Tokens Disponíveis

### Border Radius

```typescript
radius = {
  none: '0',
  xs: '2px',     // Para elementos pequenos como badges
  sm: '8px',     // Padrão para cards e botões
  md: '12px',
  lg: '16px',
  xl: '24px',
  full: '9999px' // Para elementos circulares
}
```

### Spacing

Escala semântica de espaçamento (xs a 6xl):

```typescript
spacing = {
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
}
```

### Typography

#### Font Size

```typescript
fontSize = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.25rem',    // 20px
  xl: '1.25em',     // h5
  '2xl': '1.563em', // h4
  '3xl': '1.953em', // h3
  '4xl': '2.441em', // h2
  '5xl': '3.052em', // h1
}
```

#### Line Height

```typescript
lineHeight = {
  none: '1',
  tight: '1.2',    // Para headings
  normal: '1.5',
  relaxed: '1.7',  // Para body
  loose: '2',
}
```

#### Font Weight

```typescript
fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
}
```

#### Font Family

```typescript
fontFamily = {
  sans: '"Atkinson", sans-serif',
  mono: 'ui-monospace, ...',
}
```

## 🔧 Exemplos Práticos

### Componente Svelte

```svelte
<script lang="ts">
  import { radius, spacing } from '@/styles/design-system';
</script>

<button style="border-radius: {radius.sm}; padding: {spacing.sm} {spacing.md}">
  Clique aqui
</button>
```

### Componente com Tailwind

```html
<div class="rounded-sm p-md text-base leading-relaxed font-normal">
  <h2 class="text-4xl leading-tight font-bold mb-md">Título</h2>
  <p>Conteúdo do parágrafo...</p>
</div>
```

### CSS Modules

```css
.card {
  border-radius: var(--radius-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
}

.title {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  margin-bottom: var(--spacing-md);
}
```

## 🎯 Benefícios

- ✅ Consistência visual em todo o projeto
- ✅ Type-safety com TypeScript
- ✅ Fácil manutenção centralizada
- ✅ Integração com Tailwind CSS
- ✅ Suporte a CSS custom properties
- ✅ Escalável e extensível

## 🔄 Atualizações

Para adicionar novos tokens:

1. Edite o arquivo correspondente em `tokens/` (`radius.ts`, `spacing.ts`, etc.)
2. Adicione a custom property em `tokens.css`
3. Os tokens serão automaticamente disponíveis no Tailwind

## 📚 Exemplos

Consulte os arquivos de exemplo na pasta `tokens/`:
- `example.ts` - Exemplos de uso em TypeScript
- `example.svelte` - Exemplos de uso em componentes Svelte

## 📝 Notas

- Os tokens são baseados no `global.css` existente
- As escalas de tipografia seguem uma progressão modular
- O spacing usa uma escala consistente baseada em rem
- Todos os tokens são imutáveis (`as const`)

