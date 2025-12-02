<script lang="ts">
    import UserSearchDialog from './UserSearchDialog.svelte';

    export let index: number = 0;
    export let isPrimary: boolean = false;
    export let onRemove: (() => void) | null = null;

    interface SelectedUser {
        id: number;
        nome: string;
        email: string;
        role: string;
    }

    let isSearchOpen = false;
    let selectedUser: SelectedUser | null = null;

    // Form values
    let responsavelId = '';
    let responsavelNome = '';
    let responsavelCpf = '';
    let responsavelParentesco = '';
    let responsavelTelefone = '';
    let responsavelEmail = '';

    function openSearch() {
        isSearchOpen = true;
    }

    function handleUserSelect(event: CustomEvent<SelectedUser>) {
        const user = event.detail;
        selectedUser = user;
        responsavelId = String(user.id);
        responsavelNome = user.nome;
        responsavelEmail = user.email || '';
    }

    function clearSelection() {
        selectedUser = null;
        responsavelId = '';
    }

    // CPF mask
    function handleCpfInput(event: Event) {
        const input = event.target as HTMLInputElement;
        let value = input.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        responsavelCpf = value;
    }

    // Phone mask
    function handlePhoneInput(event: Event) {
        const input = event.target as HTMLInputElement;
        let value = input.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 2) {
            value = '(' + value.slice(0, 2) + ') ' + value.slice(2);
        }
        if (value.length > 10) {
            value = value.slice(0, 10) + '-' + value.slice(10);
        }
        responsavelTelefone = value;
    }
</script>

<div class="responsavel-section" data-index={index}>
    <div class="responsavel-header">
        <h3>Responsável {index + 1} {isPrimary ? '(Principal)' : ''}</h3>
        <div class="header-actions">
            <button type="button" class="btn-search-responsavel" on:click={openSearch}>
                🔍 Buscar usuário existente
            </button>
            {#if !isPrimary && onRemove}
                <button type="button" class="btn-remove-responsavel" on:click={onRemove}>
                    Remover
                </button>
            {/if}
        </div>
    </div>

    {#if selectedUser}
        <div class="selected-user-badge">
            <span class="selected-user-name">Usuário selecionado: {selectedUser.nome}</span>
            <button type="button" class="btn-clear" title="Remover seleção" on:click={clearSelection}>&times;</button>
        </div>
    {/if}

    <input type="hidden" name="responsavel_id_{index}" bind:value={responsavelId} />

    <div class="form-grid">
        <div class="form-group">
            <label for="responsavel_nome_{index}">
                Nome Completo {#if isPrimary}<span class="required">*</span>{/if}
            </label>
            <input
                type="text"
                id="responsavel_nome_{index}"
                name="responsavel_nome_{index}"
                bind:value={responsavelNome}
                required={isPrimary}
                placeholder="Nome do responsável"
            />
        </div>
        <div class="form-group">
            <label for="responsavel_cpf_{index}">
                CPF {#if isPrimary}<span class="required">*</span>{/if}
            </label>
            <input
                type="text"
                id="responsavel_cpf_{index}"
                name="responsavel_cpf_{index}"
                value={responsavelCpf}
                on:input={handleCpfInput}
                required={isPrimary}
                placeholder="000.000.000-00"
                maxlength="14"
            />
        </div>
        <div class="form-group">
            <label for="responsavel_parentesco_{index}">
                Parentesco {#if isPrimary}<span class="required">*</span>{/if}
            </label>
            <select id="responsavel_parentesco_{index}" name="responsavel_parentesco_{index}" bind:value={responsavelParentesco} required={isPrimary}>
                <option value="">Selecione</option>
                <option value="pai">Pai</option>
                <option value="mae">Mãe</option>
                <option value="avo">Avô/Avó</option>
                <option value="tio">Tio/Tia</option>
                <option value="outro">Outro</option>
            </select>
        </div>
        <div class="form-group">
            <label for="responsavel_telefone_{index}">
                Telefone {#if isPrimary}<span class="required">*</span>{/if}
            </label>
            <input
                type="tel"
                id="responsavel_telefone_{index}"
                name="responsavel_telefone_{index}"
                value={responsavelTelefone}
                on:input={handlePhoneInput}
                required={isPrimary}
                placeholder="(00) 00000-0000"
            />
        </div>
        <div class="form-group">
            <label for="responsavel_email_{index}">Email</label>
            <input
                type="email"
                id="responsavel_email_{index}"
                name="responsavel_email_{index}"
                bind:value={responsavelEmail}
                placeholder="email@exemplo.com"
            />
        </div>
    </div>
</div>

<UserSearchDialog
    bind:isOpen={isSearchOpen}
    title="Buscar Responsável"
    placeholder="Buscar por nome ou email..."
    on:select={handleUserSelect}
/>

<style>
    .responsavel-section {
        background-color: #ffffff;
        padding: 1.25rem;
        border-radius: 6px;
        border: 1px solid #cbd5e0;
    }

    .responsavel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid #e2e8f0;
    }

    .responsavel-header h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: #2d3748;
    }

    .header-actions {
        display: flex;
        gap: 0.75rem;
        align-items: center;
    }

    .btn-search-responsavel {
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

    .btn-search-responsavel:hover {
        background-color: #2c5282;
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

    .selected-user-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        background-color: #ebf8ff;
        border: 1px solid #90cdf4;
        color: #2b6cb0;
        border-radius: 20px;
        font-size: 0.85rem;
        margin-bottom: 1rem;
    }

    .selected-user-badge .btn-clear {
        background: none;
        border: none;
        color: #4299e1;
        cursor: pointer;
        padding: 0;
        font-size: 1rem;
        line-height: 1;
        margin-left: 0.25rem;
    }

    .selected-user-badge .btn-clear:hover {
        color: #c53030;
    }

    .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
    }

    .form-group {
        display: flex;
        flex-direction: column;
    }

    .form-group label {
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
        color: #718096;
        font-weight: 500;
    }

    .form-group label .required {
        color: #e53e3e;
    }

    .form-group input,
    .form-group select {
        padding: 0.75rem;
        border: 1px solid #cbd5e0;
        border-radius: 6px;
        font-size: 1rem;
        color: #2d3748;
        background-color: #fdfdfd;
        transition: border-color 0.3s, box-shadow 0.3s;
    }

    .form-group input:focus,
    .form-group select:focus {
        outline: none;
        border-color: #3182ce;
        box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.2);
    }

    @media (max-width: 768px) {
        .responsavel-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
        }

        .header-actions {
            width: 100%;
            flex-direction: column;
        }

        .btn-search-responsavel {
            width: 100%;
            justify-content: center;
        }

        .btn-remove-responsavel {
            width: 100%;
        }

        .form-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
