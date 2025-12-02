<script lang="ts">
  /**
   * Exemplos de uso do Design System em componentes Svelte
   */
  import { radius, spacing, fontSize, fontWeight, lineHeight } from './index';
  
  // Props de exemplo
  export let variant: 'primary' | 'secondary' = 'primary';
  export let size: 'small' | 'medium' | 'large' = 'medium';
</script>

<!-- 
  ===========================================
  Exemplo 1: Usando tokens inline no style
  ===========================================
-->
<div
  class="card"
  style="
    border-radius: {radius.sm};
    padding: {spacing.lg};
  "
>
  <h2
    style="
      font-size: {fontSize['3xl']};
      font-weight: {fontWeight.bold};
      line-height: {lineHeight.tight};
      margin-bottom: {spacing.md};
    "
  >
    Título do Card
  </h2>
  <p
    style="
      font-size: {fontSize.base};
      line-height: {lineHeight.relaxed};
    "
  >
    Este é um exemplo de card usando tokens do design system diretamente no style.
  </p>
</div>

<!-- 
  ===========================================
  Exemplo 2: Usando classes do Tailwind (com tokens integrados)
  ===========================================
-->
<div class="rounded-sm p-lg">
  <h2 class="text-3xl font-bold leading-tight mb-md">
    Título com Tailwind
  </h2>
  <p class="text-base leading-relaxed">
    Este exemplo usa classes Tailwind que já estão integradas com os tokens.
  </p>
</div>

<!-- 
  ===========================================
  Exemplo 3: Botões com variantes
  ===========================================
-->
<button
  class="btn"
  class:btn-primary={variant === 'primary'}
  class:btn-secondary={variant === 'secondary'}
  class:btn-small={size === 'small'}
  class:btn-medium={size === 'medium'}
  class:btn-large={size === 'large'}
>
  Clique aqui
</button>

<!-- 
  ===========================================
  Exemplo 4: Input com tokens
  ===========================================
-->
<input
  type="text"
  placeholder="Digite algo..."
  style="
    border-radius: {radius.sm};
    padding: {spacing.sm} {spacing.md};
    font-size: {fontSize.base};
  "
/>

<!-- 
  ===========================================
  Exemplo 5: Badge
  ===========================================
-->
<span
  class="badge"
  style="
    border-radius: {radius.full};
    padding: {spacing.xs} {spacing.sm};
    font-size: {fontSize.xs};
    font-weight: {fontWeight.semibold};
  "
>
  Novo
</span>

<!-- 
  ===========================================
  Exemplo 6: Grid com spacing
  ===========================================
-->
<div
  class="grid"
  style="
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: {spacing.lg};
  "
>
  <div style="border-radius: {radius.sm}; padding: {spacing.md}">Item 1</div>
  <div style="border-radius: {radius.sm}; padding: {spacing.md}">Item 2</div>
  <div style="border-radius: {radius.sm}; padding: {spacing.md}">Item 3</div>
</div>

<style>
  /* 
    Também é possível usar CSS custom properties
    que foram importadas no global.css
  */
  .card {
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .btn {
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    border-radius: var(--radius-sm);
  }

  .btn-primary {
    background: #E11D48;
    color: white;
    font-weight: var(--font-weight-semibold);
  }

  .btn-secondary {
    background: #f3f4f6;
    color: #374151;
    font-weight: var(--font-weight-normal);
  }

  .btn-small {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-sm);
  }

  .btn-medium {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-base);
  }

  .btn-large {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: var(--font-size-lg);
  }

  .badge {
    display: inline-flex;
    align-items: center;
    background: #E11D48;
    color: white;
    line-height: var(--line-height-none);
  }

  .grid > div {
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  input {
    width: 100%;
    border: 1px solid #d1d5db;
    outline: none;
  }

  input:focus {
    border-color: #E11D48;
  }
</style>

