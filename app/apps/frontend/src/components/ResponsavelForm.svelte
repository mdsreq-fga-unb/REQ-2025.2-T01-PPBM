<script lang="ts">
    import UserSearchDialog from './UserSearchDialog.svelte';

    export let index: number = 0;
    export let isPrimary: boolean = false;
    export let onRemove: (() => void) | null = null;

    interface SelectedUser {
        id: number;
        nome: string;
        email: string;
        telefone?: string;
        role: string;
    }

    let isSearchOpen = false;
    let selectedUser: SelectedUser | null = null;
    let responsavelParentesco = '';

    function openSearch() {
        isSearchOpen = true;
    }

    function handleUserSelect(event: CustomEvent<SelectedUser>) {
        const user = event.detail;
        selectedUser = user;
    }

    function clearSelection() {
        selectedUser = null;
        responsavelParentesco = '';
    }
</script>

{#if selectedUser}
    <!-- Selected responsável display -->
    <div class="responsavel-item">
        <input type="hidden" name="responsavel_id_{index}" value={selectedUser.id} />
        <input type="hidden" name="responsavel_nome_{index}" value={selectedUser.nome} />
        <input type="hidden" name="responsavel_email_{index}" value={selectedUser.email || ''} />
        
        <div class="responsavel-info">
            <div class="responsavel-nome">
                {selectedUser.nome}
                {#if isPrimary}
                    <span class="badge-primary">Principal</span>
                {/if}
            </div>
            <div class="responsavel-details">
                {selectedUser.email || 'Sem email'}
            </div>
        </div>
        
        <div class="responsavel-actions">
            <div class="parentesco-select">
                <label for="responsavel_parentesco_{index}" class="sr-only">Parentesco</label>
                <select 
                    id="responsavel_parentesco_{index}" 
                    name="responsavel_parentesco_{index}" 
                    bind:value={responsavelParentesco} 
                    required={isPrimary}
                    class="select-parentesco"
                >
                    <option value="">Parentesco</option>
                    <option value="pai">Pai</option>
                    <option value="mae">Mãe</option>
                    <option value="avo">Avô/Avó</option>
                    <option value="tio">Tio/Tia</option>
                    <option value="outro">Outro</option>
                </select>
            </div>
            <button type="button" class="btn-remove-responsavel" on:click={clearSelection}>
                Remover
            </button>
        </div>
    </div>
{:else}
    <!-- Empty state - prompt to select -->
    <div class="responsavel-empty">
        <div class="empty-info">
            <span class="empty-label">
                Responsável {index + 1} {isPrimary ? '(Principal)' : ''}
                {#if isPrimary}<span class="required">*</span>{/if}
            </span>
            <span class="empty-hint">Selecione um responsável existente</span>
        </div>
        <div class="empty-actions">
            <button type="button" class="btn-select-responsavel" on:click={openSearch}>
                🔍 Selecionar Responsável
            </button>
            {#if !isPrimary && onRemove}
                <button type="button" class="btn-cancel" on:click={onRemove}>
                    Cancelar
                </button>
            {/if}
        </div>
    </div>
{/if}

<UserSearchDialog
    bind:isOpen={isSearchOpen}
    title="Selecionar Responsável"
    placeholder="Buscar por nome ou email..."
    filterRole="responsavel"
    on:select={handleUserSelect}
/>

<style>
    .responsavel-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.25rem;
        background-color: #ffffff;
        border: 1px solid #cbd5e0;
        border-radius: 6px;
    }

    .responsavel-info {
        display: flex;
        flex-direction: column;
        flex: 1;
    }

    .responsavel-nome {
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 0.25rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .badge-primary {
        display: inline-block;
        padding: 0.125rem 0.5rem;
        background-color: #ebf8ff;
        color: #2b6cb0;
        font-size: 0.75rem;
        font-weight: 500;
        border-radius: 4px;
    }

    .responsavel-details {
        font-size: 0.85rem;
        color: #718096;
    }

    .responsavel-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .parentesco-select {
        display: flex;
        align-items: center;
    }

    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        border: 0;
    }

    .select-parentesco {
        padding: 0.5rem 0.75rem;
        border: 1px solid #cbd5e0;
        border-radius: 4px;
        font-size: 0.85rem;
        color: #2d3748;
        background-color: #ffffff;
        cursor: pointer;
    }

    .select-parentesco:focus {
        outline: none;
        border-color: #3182ce;
        box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.2);
    }

    .btn-remove-responsavel {
        padding: 0.375rem 0.75rem;
        background-color: #FED7D7;
        color: #C53030;
        border: none;
        border-radius: 4px;
        font-size: 0.85rem;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .btn-remove-responsavel:hover {
        background-color: #FEB2B2;
    }

    /* Empty state */
    .responsavel-empty {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.25rem;
        background-color: #ffffff;
        border: 1px dashed #cbd5e0;
        border-radius: 6px;
    }

    .empty-info {
        display: flex;
        flex-direction: column;
    }

    .empty-label {
        font-weight: 500;
        color: #2d3748;
        margin-bottom: 0.25rem;
    }

    .empty-label .required {
        color: #e53e3e;
    }

    .empty-hint {
        font-size: 0.85rem;
        color: #718096;
    }

    .empty-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .btn-select-responsavel {
        padding: 0.5rem 1rem;
        background-color: #3182ce;
        color: #ffffff;
        border: none;
        border-radius: 6px;
        font-size: 0.85rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
    }

    .btn-select-responsavel:hover {
        background-color: #2c5282;
    }

    .btn-cancel {
        padding: 0.375rem 0.75rem;
        background-color: #e2e8f0;
        color: #4a5568;
        border: none;
        border-radius: 4px;
        font-size: 0.85rem;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .btn-cancel:hover {
        background-color: #cbd5e0;
    }

    @media (max-width: 768px) {
        .responsavel-item,
        .responsavel-empty {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
        }

        .responsavel-actions,
        .empty-actions {
            width: 100%;
            flex-direction: column;
        }

        .btn-select-responsavel,
        .btn-remove-responsavel,
        .btn-cancel {
            width: 100%;
            justify-content: center;
        }

        .select-parentesco {
            width: 100%;
        }
    }
</style>
