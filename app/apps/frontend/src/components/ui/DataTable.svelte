<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Column, RenderObject, SortDirection, SortState } from '../../interfaces/table';

    export let columns: Column[] = [];
    export let rows: any[] = [];
    export let loading: boolean = false;
    export let emptyMessage: string = 'Nenhum item encontrado.';
    export let loadingMessage: string = 'Carregando...';
    export let keyField: string = 'id';
    
    // Pagination props
    export let showPagination: boolean = false;
    export let currentPage: number = 1;
    export let totalPages: number = 1;
    export let pageInfo: string = '';

    const dispatch = createEventDispatcher();

    let sortState: SortState = { column: null, direction: null };

    // Type guard for RenderObject
    function isRenderObject(obj: any): obj is RenderObject {
        return obj && typeof obj === 'object' && 'component' in obj && 'props' in obj;
    }

    function handleSort(column: Column) {
        if (!column.sortable) return;

        let newDirection: SortDirection;
        
        if (sortState.column === column.key) {
            // Cycle through: asc -> desc -> null
            if (sortState.direction === 'asc') {
                newDirection = 'desc';
            } else if (sortState.direction === 'desc') {
                newDirection = null;
            } else {
                newDirection = 'asc';
            }
        } else {
            newDirection = 'asc';
        }

        sortState = {
            column: newDirection ? column.key : null,
            direction: newDirection
        };

        dispatch('sort', sortState);
    }

    function getSortIcon(column: Column): string {
        if (!column.sortable) return '';
        if (sortState.column !== column.key) return '↕';
        return sortState.direction === 'asc' ? '↑' : '↓';
    }

    function getAlignClass(align?: 'left' | 'center' | 'right'): string {
        switch (align) {
            case 'center': return 'text-center';
            case 'right': return 'text-right';
            default: return 'text-left';
        }
    }

    function getCellStyle(column: Column): string {
        if (column.width === 'min') {
            return 'width: min-content; white-space: nowrap;';
        }
        if (column.width) {
            return `width: ${column.width};`;
        }
        return '';
    }

    function handleButtonClick(props: any) {
        if (props.onClick) {
            props.onClick();
        }
    }

    // Sort rows if needed
    $: sortedRows = (() => {
        if (!sortState.column || !sortState.direction) return rows;
        
        return [...rows].sort((a, b) => {
            const aVal = a[sortState.column!];
            const bVal = b[sortState.column!];
            
            if (aVal === bVal) return 0;
            if (aVal === null || aVal === undefined) return 1;
            if (bVal === null || bVal === undefined) return -1;
            
            const comparison = String(aVal).localeCompare(String(bVal), 'pt-BR', { numeric: true });
            return sortState.direction === 'asc' ? comparison : -comparison;
        });
    })();
</script>

<div class="table-wrapper">
    {#if loading}
        <div class="table-state loading-state">
            <span class="loading-spinner"></span>
            {loadingMessage}
        </div>
    {:else if rows.length === 0}
        <div class="table-state empty-state">
            {emptyMessage}
        </div>
    {:else}
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        {#each columns as column}
                            <th 
                                class="{getAlignClass(column.align)} {column.sortable ? 'sortable' : ''}"
                                style={getCellStyle(column)}
                                on:click={() => handleSort(column)}
                                title={column.tooltip || ''}
                            >
                                <div class="th-content">
                                    <span>{column.label}</span>
                                    {#if column.sortable}
                                        <span class="sort-icon" class:active={sortState.column === column.key}>
                                            {getSortIcon(column)}
                                        </span>
                                    {/if}
                                </div>
                            </th>
                        {/each}
                    </tr>
                </thead>
                <tbody>
                    {#each sortedRows as row (row[keyField])}
                        <tr>
                            {#each columns as column}
                                <td 
                                    class="{getAlignClass(column.align)}"
                                    style={getCellStyle(column)}
                                >
                                    {#if column.render}
                                        {@const renderResult = column.render(row)}
                                        {#if Array.isArray(renderResult)}
                                            <div class="cell-content">
                                                {#each renderResult as item}
                                                    {#if typeof item === 'string'}
                                                        {item}
                                                    {:else if isRenderObject(item)}
                                                        {#if item.component === 'button'}
                                                            <button 
                                                                type="button"
                                                                class="btn-action btn-{item.props.variant || 'primary'}"
                                                                title={item.props.title || item.props.text || ''}
                                                                on:click={() => handleButtonClick(item.props)}
                                                            >
                                                                {item.props.text || ''}
                                                            </button>
                                                        {:else if item.component === 'a'}
                                                            <a 
                                                                href={item.props.href}
                                                                class="btn-action btn-{item.props.variant || 'primary'}"
                                                                title={item.props.title || item.props.text || ''}
                                                            >
                                                                {item.props.text || ''}
                                                            </a>
                                                        {:else if item.component === 'badge'}
                                                            <span class="badge badge-{item.props.variant || 'default'} {item.props.class || ''}">
                                                                {item.props.text || ''}
                                                            </span>
                                                        {:else if item.component === 'span'}
                                                            <span class={item.props.class || ''}>
                                                                {item.props.text || ''}
                                                            </span>
                                                        {:else if item.component === 'html'}
                                                            {@html item.props.html}
                                                        {/if}
                                                    {/if}
                                                {/each}
                                            </div>
                                        {:else if typeof renderResult === 'string'}
                                            {renderResult}
                                        {:else if isRenderObject(renderResult)}
                                            {#if renderResult.component === 'button'}
                                                <button 
                                                    type="button"
                                                    class="btn-action btn-{renderResult.props.variant || 'primary'}"
                                                    title={renderResult.props.title || renderResult.props.text || ''}
                                                    on:click={() => handleButtonClick(renderResult.props)}
                                                >
                                                    {renderResult.props.text || ''}
                                                </button>
                                            {:else if renderResult.component === 'a'}
                                                <a 
                                                    href={renderResult.props.href}
                                                    class="btn-action btn-{renderResult.props.variant || 'primary'}"
                                                    title={renderResult.props.title || renderResult.props.text || ''}
                                                >
                                                    {renderResult.props.text || ''}
                                                </a>
                                            {:else if renderResult.component === 'badge'}
                                                <span class="badge badge-{renderResult.props.variant || 'default'} {renderResult.props.class || ''}">
                                                    {renderResult.props.text || ''}
                                                </span>
                                            {:else if renderResult.component === 'span'}
                                                <span class={renderResult.props.class || ''}>
                                                    {renderResult.props.text || ''}
                                                </span>
                                            {:else if renderResult.component === 'html'}
                                                {@html renderResult.props.html}
                                            {/if}
                                        {/if}
                                    {:else}
                                        {row[column.key] ?? '-'}
                                    {/if}
                                </td>
                            {/each}
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        
        {#if showPagination && totalPages > 1}
            <div class="pagination">
                <button 
                    type="button"
                    disabled={currentPage <= 1}
                    on:click={() => dispatch('pageChange', currentPage - 1)}
                >
                    ← Anterior
                </button>
                <span class="page-info">{pageInfo || `Página ${currentPage} de ${totalPages}`}</span>
                <button 
                    type="button"
                    disabled={currentPage >= totalPages}
                    on:click={() => dispatch('pageChange', currentPage + 1)}
                >
                    Próxima →
                </button>
            </div>
        {/if}
    {/if}
</div>

<style>
    .table-wrapper {
        width: 100%;
    }

    .table-container {
        overflow-x: auto;
        border-radius: 8px;
    }

    .data-table {
        width: 100%;
        border-collapse: collapse;
        background-color: #ffffff;
    }

    .data-table thead {
        background-color: #e2e8f0;
    }

    .data-table th {
        padding: 1rem;
        font-weight: 600;
        color: #2d3748;
        font-size: 0.9rem;
        border-bottom: 2px solid #cbd5e0;
        user-select: none;
    }

    .data-table th.sortable {
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .data-table th.sortable:hover {
        background-color: #cbd5e0;
    }

    .th-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .sort-icon {
        font-size: 0.8rem;
        color: #a0aec0;
        transition: color 0.2s;
    }

    .sort-icon.active {
        color: #3182ce;
    }

    .data-table td {
        padding: 1rem;
        border-bottom: 1px solid #cbd5e0;
        font-size: 0.95rem;
        color: #2d3748;
        vertical-align: middle;
    }

    .data-table tbody tr {
        transition: background-color 0.15s;
    }

    .data-table tbody tr:hover {
        background-color: #f7fafc;
    }

    .data-table tbody tr:last-child td {
        border-bottom: none;
    }

    .text-left {
        text-align: left;
    }

    .text-center {
        text-align: center;
    }

    .text-right {
        text-align: right;
    }

    .cell-content {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        align-items: center;
    }

    /* Button styles */
    .btn-action {
        padding: 0.5rem 1rem;
        border-radius: 6px;
        border: none;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    .btn-primary {
        background-color: #3182ce;
        color: #ffffff;
    }

    .btn-primary:hover {
        background-color: #2c5282;
    }

    .btn-secondary {
        background-color: #e2e8f0;
        color: #4a5568;
    }

    .btn-secondary:hover {
        background-color: #cbd5e0;
    }

    .btn-danger {
        background-color: #e53e3e;
        color: #ffffff;
    }

    .btn-danger:hover {
        background-color: #c53030;
    }

    .btn-success {
        background-color: #48bb78;
        color: #ffffff;
    }

    .btn-success:hover {
        background-color: #38a169;
    }

    .btn-warning {
        background-color: #ed8936;
        color: #ffffff;
    }

    .btn-warning:hover {
        background-color: #dd6b20;
    }

    /* Badge styles */
    .badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 500;
    }

    .badge-default {
        background-color: #e2e8f0;
        color: #4a5568;
    }

    .badge-success {
        background-color: #c6f6d5;
        color: #2f855a;
    }

    .badge-warning {
        background-color: #fefcbf;
        color: #b7791f;
    }

    .badge-danger {
        background-color: #fed7d7;
        color: #c53030;
    }

    .badge-info {
        background-color: #bee3f8;
        color: #2b6cb0;
    }

    .badge-purple {
        background-color: #e9d8fd;
        color: #6b46c1;
    }

    /* State styles */
    .table-state {
        text-align: center;
        padding: 3rem 1rem;
        color: #718096;
        font-size: 1rem;
    }

    .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    .loading-spinner {
        width: 32px;
        height: 32px;
        border: 3px solid #e2e8f0;
        border-top-color: #3182ce;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .empty-state {
        background-color: #f7fafc;
        border-radius: 8px;
        border: 1px dashed #cbd5e0;
    }

    /* Pagination styles */
    .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
        margin-top: 1.5rem;
    }

    .pagination button {
        padding: 0.5rem 1rem;
        border: 1px solid #cbd5e0;
        background-color: #ffffff;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background-color 0.2s;
    }

    .pagination button:hover:not(:disabled) {
        background-color: #e2e8f0;
    }

    .pagination button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .page-info {
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
        color: #718096;
    }

    /* Responsive styles */
    @media (max-width: 768px) {
        .table-container {
            overflow-x: scroll;
        }

        .data-table {
            min-width: 700px;
        }

        .data-table th,
        .data-table td {
            padding: 0.75rem;
            font-size: 0.9rem;
        }

        .cell-content {
            flex-direction: column;
            align-items: flex-start;
        }

        .btn-action {
            width: 100%;
        }
    }

    @media (max-width: 480px) {
        .data-table th,
        .data-table td {
            padding: 0.5rem;
            font-size: 0.85rem;
        }
    }
</style>
