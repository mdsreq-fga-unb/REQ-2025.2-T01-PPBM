/**
 * UI Components
 * 
 * === ASTRO COMPONENTS (Server-side only) ===
 * Use these in .astro files for static content:
 * 
 * ---
 * import FormSelect from '../components/ui/FormSelect.astro';
 * import FormInput from '../components/ui/FormInput.astro';
 * import FilterRow from '../components/ui/FilterRow.astro';
 * ---
 * 
 * <FilterRow>
 *   <FormInput id="search" label="Buscar" placeholder="Digite..." fullWidth />
 *   <FormSelect id="filter" label="Filtrar por">
 *     <option value="">Todos</option>
 *     <option value="1">Opção 1</option>
 *   </FormSelect>
 * </FilterRow>
 * 
 * === SVELTE COMPONENTS (Client-side & Server-side) ===
 * Use these for dynamic/interactive content or in JavaScript:
 * 
 * ---
 * import FormSelectSvelte from '../components/ui/FormSelect.svelte';
 * ---
 * 
 * <!-- Static (server-rendered) -->
 * <FormSelectSvelte id="filter" label="Filtrar" options={[{value: '1', label: 'Opção 1'}]} />
 * 
 * <!-- Interactive (client-hydrated) -->
 * <FormSelectSvelte client:load id="filter" label="Filtrar" on:change={handleChange} />
 * 
 * The Svelte version also supports an `options` prop for programmatic use:
 * options={[{ value: 'a', label: 'Option A' }, { value: 'b', label: 'Option B' }]}
 */

// Export Svelte components for use in other Svelte files or dynamic contexts
export { default as FormSelectSvelte } from './FormSelect.svelte';

export { default as FormSelect } from './FormSelect.astro';
export { default as FormInput } from './FormInput.astro';
export { default as FilterRow } from './FilterRow.astro';
