<script lang="ts">
    import { onMount } from 'svelte';
    import RoleSelect from './RoleSelect.svelte';

    interface User {
        email: string;
        nome: string | null;
        role: 'admin' | 'docente' | 'responsavel';
        created_at: string;
    }

    // Props
    export let apiUrl: string = 'http://localhost:3000';

    // State
    let allUsers: User[] = [];
    let filteredUsers: User[] = [];
    let isLoading = true;
    let errorMessage = '';
    let searchTerm = '';
    let roleFilter = '';

    // Modal state
    let showModal = false;
    let pendingChange: {
        email: string;
        userName: string;
        originalRole: string;
        newRole: string;
        revert: () => void;
    } | null = null;
    let isSaving = false;

    // Toast state
    let toastMessage = '';
    let toastType: 'success' | 'error' = 'success';
    let showToast = false;

    // Stats
    $: stats = {
        total: allUsers.length,
        admins: allUsers.filter(u => u.role === 'admin').length,
        docentes: allUsers.filter(u => u.role === 'docente').length,
        responsaveis: allUsers.filter(u => u.role === 'responsavel').length
    };

    // Filtered users
    $: {
        filteredUsers = allUsers.filter(user => {
            const matchSearch = !searchTerm || 
                (user.nome && user.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchRole = !roleFilter || user.role === roleFilter;
            return matchSearch && matchRole;
        });
    }

    async function getAuthToken(): Promise<string | null> {
        return localStorage.getItem('bm_token');
    }

    function displayToast(message: string, type: 'success' | 'error' = 'success') {
        toastMessage = message;
        toastType = type;
        showToast = true;
        setTimeout(() => {
            showToast = false;
        }, 3000);
    }

    async function loadUsers() {
        isLoading = true;
        errorMessage = '';

        try {
            const token = await getAuthToken();
            const response = await fetch(`${apiUrl}/usuarios/todos-com-roles`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Erro ao carregar usuários');
            }

            allUsers = data.data || [];
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            errorMessage = error instanceof Error ? error.message : 'Erro ao carregar usuários';
            displayToast(errorMessage, 'error');
        } finally {
            isLoading = false;
        }
    }

    function handleRoleChange(event: CustomEvent) {
        const { email, userName, originalRole, newRole, revert } = event.detail;
        pendingChange = { email, userName, originalRole, newRole, revert };
        showModal = true;
    }

    function cancelRoleChange() {
        if (pendingChange?.revert) {
            pendingChange.revert();
        }
        pendingChange = null;
        showModal = false;
    }

    async function confirmRoleChange() {
        if (!pendingChange) return;

        isSaving = true;
        const { email, newRole } = pendingChange;

        try {
            const token = await getAuthToken();
            const response = await fetch(`${apiUrl}/usuarios/atualizar-role/${encodeURIComponent(email)}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ newRole })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Erro ao atualizar papel');
            }

            // Update local data
            const userIndex = allUsers.findIndex(u => u.email === email);
            if (userIndex !== -1) {
                allUsers[userIndex] = { ...allUsers[userIndex], role: newRole as User['role'] };
                allUsers = [...allUsers]; // Trigger reactivity
            }

            displayToast(`Papel atualizado para ${newRole === 'docente' ? 'Docente' : 'Responsável'}`, 'success');
            showModal = false;
            pendingChange = null;
        } catch (error) {
            console.error('Erro ao atualizar papel:', error);
            displayToast(error instanceof Error ? error.message : 'Erro ao atualizar papel', 'error');
            
            if (pendingChange?.revert) {
                pendingChange.revert();
            }
            showModal = false;
            pendingChange = null;
        } finally {
            isSaving = false;
        }
    }

    function formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    onMount(() => {
        loadUsers();
    });
</script>

<!-- Stats Bar -->
<div class="stats-bar">
    <div class="stat-item">
        <span class="stat-value">{stats.total}</span>
        <span class="stat-label">Total</span>
    </div>
    <div class="stat-item admin">
        <span class="stat-value">{stats.admins}</span>
        <span class="stat-label">Admins</span>
    </div>
    <div class="stat-item docente">
        <span class="stat-value">{stats.docentes}</span>
        <span class="stat-label">Docentes</span>
    </div>
    <div class="stat-item responsavel">
        <span class="stat-value">{stats.responsaveis}</span>
        <span class="stat-label">Responsáveis</span>
    </div>
    <button class="btn-refresh" on:click={loadUsers}>🔄 Atualizar</button>
</div>

<!-- Filters -->
<div class="filter-row">
    <div class="form-group full-width">
        <label for="buscar">Buscar usuário</label>
        <input 
            type="text" 
            id="buscar" 
            placeholder="Nome ou email..."
            bind:value={searchTerm}
        />
    </div>
    <div class="form-group">
        <label for="role-filter">Filtrar por papel</label>
        <select id="role-filter" bind:value={roleFilter}>
            <option value="">Todos os papéis</option>
            <option value="admin">Admin</option>
            <option value="docente">Docente</option>
            <option value="responsavel">Responsável</option>
        </select>
    </div>
</div>

<!-- Table -->
<div class="table-container">
    {#if isLoading}
        <div class="loading-state">Carregando usuários...</div>
    {:else if errorMessage}
        <div class="error-state">{errorMessage}</div>
    {:else if filteredUsers.length === 0}
        <div class="empty-state">Nenhum usuário encontrado com os filtros selecionados.</div>
    {:else}
        <table class="table">
            <thead>
                <tr>
                    <th>Usuário</th>
                    <th>Papel</th>
                    <th>Data de Cadastro</th>
                </tr>
            </thead>
            <tbody>
                {#each filteredUsers as user (user.email)}
                    <tr>
                        <td>
                            <div class="user-info">
                                <span class="user-name">{user.nome || 'Sem nome'}</span>
                                <span class="user-email">{user.email}</span>
                            </div>
                        </td>
                        <td>
                            <RoleSelect
                                email={user.email}
                                userName={user.nome || user.email}
                                role={user.role}
                                disabled={user.role === 'admin'}
                                on:roleChange={handleRoleChange}
                            />
                        </td>
                        <td>{formatDate(user.created_at)}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
</div>

<!-- Confirmation Modal -->
{#if showModal}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_interactive_supports_focus -->
    <div 
        class="modal-overlay" 
        on:click={cancelRoleChange} 
        on:keydown={(e) => e.key === 'Escape' && cancelRoleChange()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
    >
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <div class="modal" on:click|stopPropagation>
            <h3 class="modal-title" id="modal-title">Confirmar alteração</h3>
            <p class="modal-message">
                Deseja alterar o papel de <strong>{pendingChange?.userName}</strong> de 
                <strong>{pendingChange?.originalRole === 'docente' ? 'Docente' : 'Responsável'}</strong> para 
                <strong>{pendingChange?.newRole === 'docente' ? 'Docente' : 'Responsável'}</strong>?
            </p>
            <div class="modal-buttons">
                <button type="button" class="modal-btn modal-btn-cancel" on:click={cancelRoleChange} disabled={isSaving}>
                    Cancelar
                </button>
                <button type="button" class="modal-btn modal-btn-confirm" on:click={confirmRoleChange} disabled={isSaving}>
                    {isSaving ? 'Salvando...' : 'Confirmar'}
                </button>
            </div>
        </div>
    </div>
{/if}

<!-- Toast -->
{#if showToast}
    <div class="toast {toastType} show">{toastMessage}</div>
{/if}

<style>
    /* Stats Bar */
    .stats-bar {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        align-items: center;
    }
    .stat-item {
        background: var(--secondary-color, #E2E8F0);
        padding: 0.75rem 1.25rem;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 80px;
    }
    .stat-item.admin { background: #FED7D7; }
    .stat-item.docente { background: #BEE3F8; }
    .stat-item.responsavel { background: #C6F6D5; }
    .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-color, #2D3748);
    }
    .stat-label {
        font-size: 0.8rem;
        color: var(--label-color, #718096);
        text-transform: uppercase;
    }
    .btn-refresh {
        margin-left: auto;
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        border: none;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        background-color: var(--primary-color, #4A5568);
        color: white;
    }
    .btn-refresh:hover {
        background-color: #2D3748;
    }

    /* Filter Row */
    .filter-row {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
    }
    .form-group {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 200px;
    }
    .form-group.full-width {
        flex: 2;
    }
    .form-group label {
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
        color: var(--label-color, #718096);
        font-weight: 500;
    }
    .form-group input,
    .form-group select {
        padding: 0.75rem;
        border: 1px solid var(--border-color, #CBD5E0);
        border-radius: 6px;
        font-size: 1rem;
        color: var(--text-color, #2D3748);
        background-color: #FDFDFD;
    }
    .form-group input:focus,
    .form-group select:focus {
        outline: none;
        border-color: #3182CE;
        box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.2);
    }
    .form-group select {
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23718096' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 0.75rem center;
        padding-right: 2.5rem;
        cursor: pointer;
    }

    /* Table */
    .table-container {
        overflow-x: auto;
        margin-top: 1rem;
    }
    .table {
        width: 100%;
        border-collapse: collapse;
        background-color: white;
    }
    .table thead {
        background-color: var(--secondary-color, #E2E8F0);
    }
    .table th {
        text-align: left;
        padding: 1rem;
        font-weight: 600;
        color: var(--text-color, #2D3748);
        border-bottom: 2px solid var(--border-color, #CBD5E0);
    }
    .table td {
        padding: 1rem;
        border-bottom: 1px solid var(--border-color, #CBD5E0);
        vertical-align: middle;
    }
    .table tbody tr:hover {
        background-color: #F7FAFC;
    }
    .user-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    .user-name {
        font-weight: 600;
        color: var(--text-color, #2D3748);
    }
    .user-email {
        font-size: 0.85rem;
        color: var(--label-color, #718096);
    }

    /* States */
    .loading-state,
    .empty-state,
    .error-state {
        text-align: center;
        padding: 3rem;
        color: var(--label-color, #718096);
        font-size: 1.1rem;
    }
    .error-state {
        color: var(--danger-color, #E53E3E);
    }

    /* Modal */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }
    .modal {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }
    .modal-title {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0 0 1rem 0;
        color: var(--text-color, #2D3748);
    }
    .modal-message {
        color: var(--label-color, #718096);
        margin: 0 0 1.5rem 0;
        line-height: 1.5;
    }
    .modal-message strong {
        color: var(--text-color, #2D3748);
    }
    .modal-buttons {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
    }
    .modal-btn {
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        border: none;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    .modal-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    .modal-btn-cancel {
        background-color: var(--secondary-color, #E2E8F0);
        color: var(--text-color, #2D3748);
    }
    .modal-btn-cancel:hover:not(:disabled) {
        background-color: #CBD5E0;
    }
    .modal-btn-confirm {
        background-color: var(--accent-color, #3182CE);
        color: white;
    }
    .modal-btn-confirm:hover:not(:disabled) {
        background-color: #2B6CB0;
    }

    /* Toast */
    .toast {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s;
        z-index: 1001;
    }
    .toast.show {
        opacity: 1;
        transform: translateY(0);
    }
    .toast.success {
        background-color: var(--success-color, #48BB78);
    }
    .toast.error {
        background-color: var(--danger-color, #E53E3E);
    }

    @media (max-width: 768px) {
        .filter-row {
            flex-direction: column;
        }
        .form-group {
            width: 100%;
        }
        .stats-bar {
            justify-content: center;
        }
        .btn-refresh {
            margin-left: 0;
            width: 100%;
        }
    }
</style>
