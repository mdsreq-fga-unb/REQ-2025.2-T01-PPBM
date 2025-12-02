<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    // Props
    export let id: string = '';
    export let name: string = '';
    export let label: string = '';
    export let required: boolean = false;
    export let disabled: boolean = false;
    export let value: string = '';
    export let className: string = '';
    export let fullWidth: boolean = false;
    export let width: string = '';
    export let ariaLabel: string = '';
    export let labelAlign: 'left' | 'right' = 'left';
    export let inline: boolean = false;
    export let size: 'sm' | 'md' | 'lg' = 'md';
    
    /** Options array for programmatic use */
    export let options: Array<{ value: string; label: string; selected?: boolean }> = [];

    const dispatch = createEventDispatcher();

    function handleChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        value = target.value;
        dispatch('change', { value, event });
    }

    $: selectClasses = [
        'form-select',
        `size-${size}`,
        className
    ].filter(Boolean).join(' ');

    $: groupClasses = [
        'form-group',
        fullWidth ? 'full-width' : ''
    ].filter(Boolean).join(' ');

    $: groupStyle = width ? `min-width: ${width};` : '';
    $: selectStyle = width ? `width: ${width};` : '';
</script>

{#if inline}
    <select
        {id}
        {name}
        {required}
        {disabled}
        aria-label={ariaLabel || label}
        class={selectClasses}
        style={selectStyle}
        bind:value
        on:change={handleChange}
    >
        {#if options.length > 0}
            {#each options as option}
                <option value={option.value} selected={option.selected}>{option.label}</option>
            {/each}
        {:else}
            <slot />
        {/if}
    </select>
{:else}
    <div class={groupClasses} style={groupStyle}>
        {#if label}
            <label for={id} class:label-right={labelAlign === 'right'}>
                {label}
                {#if required}
                    <span class="required-mark">*</span>
                {/if}
            </label>
        {/if}
        <select
            {id}
            {name}
            {required}
            {disabled}
            aria-label={ariaLabel || label}
            class={selectClasses}
            style={selectStyle}
            bind:value
            on:change={handleChange}
        >
            {#if options.length > 0}
                {#each options as option}
                    <option value={option.value} selected={option.selected}>{option.label}</option>
                {/each}
            {:else}
                <slot />
            {/if}
        </select>
    </div>
{/if}

<style>
    .form-group {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 200px;
    }

    .form-group.full-width {
        flex: 2;
    }

    label {
        display: block;
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
        color: var(--label-color, #718096);
        font-weight: 500;
    }

    label.label-right {
        text-align: right;
    }

    .required-mark {
        color: #E53E3E;
        margin-left: 2px;
    }

    .form-select {
        padding: 0.75rem;
        border: 1px solid var(--border-color, #CBD5E0);
        border-radius: 6px;
        font-size: 1rem;
        color: var(--text-color, #2D3748);
        background-color: #FDFDFD;
        transition: border-color 0.2s, box-shadow 0.2s;
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23718096' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 0.75rem center;
        padding-right: 2.5rem;
    }

    .form-select.size-sm {
        padding: 0.5rem;
        padding-right: 2rem;
        font-size: 0.875rem;
    }

    .form-select.size-lg {
        padding: 1rem;
        padding-right: 3rem;
        font-size: 1.125rem;
    }

    .form-select:focus {
        outline: none;
        border-color: #3182CE;
        box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.2);
    }

    .form-select:disabled {
        background-color: #EDF2F7;
        cursor: not-allowed;
        color: #718096;
    }

    @media (max-width: 768px) {
        .form-group {
            width: 100%;
        }
    }
</style>
