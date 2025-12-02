<script lang="ts">
    import { onMount, createEventDispatcher } from "svelte";
    import { apiFetch } from "../lib/api";

    export let isOpen = false;
    export let title = "Buscar Usuário";
    export let placeholder = "Buscar por nome ou email...";
    export let filterRole: string | null = null; // Optional: filter by role (e.g., 'responsavel', 'docente', 'admin')
    export let multiSelect = false; // Enable multi-user selection
    export let selectedUsers: User[] = []; // Pre-selected users for multi-select mode
    export let useDirectEndpoint = false; // Use direct docentes endpoint instead of usuarios

    const dispatch = createEventDispatcher();

    interface User {
        id: number;
        nome: string;
        email: string;
        role: "admin" | "docente" | "responsavel";
    }

    let allUsers: User[] = [];
    let filteredUsers: User[] = [];
    let searchQuery = "";
    let isLoading = true;
    let searchTimeout: ReturnType<typeof setTimeout> | null = null;
    let dialogElement: HTMLDivElement;
    let searchInputElement: HTMLInputElement;
    let internalSelectedUsers: User[] = [];

    // Initialize internal selected users from prop
    $: if (multiSelect) {
        internalSelectedUsers = [...selectedUsers];
    }

    // Load users from API
    async function loadUsers() {
        isLoading = true;
        try {
            // If filterRole is 'docente' and useDirectEndpoint is true, fetch from docentes endpoint
            if (filterRole === "docente" && useDirectEndpoint) {
                const response = await apiFetch(
                    "/docentes/listar?pageSize=100",
                );
                console.log(
                    "UserSearchDialog - Docentes API response:",
                    response,
                );
                if (response.success && response.data) {
                    const backendData = response.data as any;
                    const docentes = backendData.data || backendData || [];
                    allUsers = docentes.map((d: any) => ({
                        id: d.id_docente,
                        nome: d.nome_docente || "",
                        email: d.email_docente || "",
                        role: "docente" as const,
                    }));
                }
            } else {
                const response = await apiFetch("/usuarios/todos-com-roles");
                console.log("UserSearchDialog - API response:", response);
                if (response.success && response.data) {
                    const backendData = response.data as any;
                    if (backendData.data && Array.isArray(backendData.data)) {
                        allUsers = backendData.data;
                    } else if (Array.isArray(backendData)) {
                        allUsers = backendData;
                    } else {
                        console.warn(
                            "Unexpected users data format:",
                            backendData,
                        );
                        allUsers = [];
                    }

                    // Apply role filter if specified
                    if (filterRole) {
                        allUsers = allUsers.filter(
                            (u) => u.role === filterRole,
                        );
                    }
                }
            }
            console.log("UserSearchDialog - Loaded users:", allUsers);
            // Initialize filtered users with all users
            filteredUsers = [...allUsers];
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
            allUsers = [];
            filteredUsers = [];
        } finally {
            isLoading = false;
        }
    }

    // Filter users based on search query
    function filterUsers(query: string) {
        const normalizedQuery = query.toLowerCase().trim();

        if (!normalizedQuery) {
            // Show all users when no search query
            filteredUsers = [...allUsers];
            return;
        }

        filteredUsers = allUsers.filter((user) => {
            const nome = (user.nome || "").toLowerCase();
            const email = (user.email || "").toLowerCase();
            return (
                nome.includes(normalizedQuery) ||
                email.includes(normalizedQuery)
            );
        });
    }

    // Handle search input
    function handleSearchInput(event: Event) {
        const target = event.target as HTMLInputElement;
        searchQuery = target.value;

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        searchTimeout = setTimeout(() => {
            filterUsers(searchQuery);
        }, 200);
    }

    // Check if user is selected (for multi-select mode)
    function isUserSelected(user: User): boolean {
        return internalSelectedUsers.some((u) => u.id === user.id);
    }

    // Toggle user selection (for multi-select mode)
    function toggleUserSelection(user: User) {
        if (isUserSelected(user)) {
            internalSelectedUsers = internalSelectedUsers.filter(
                (u) => u.id !== user.id,
            );
        } else {
            internalSelectedUsers = [...internalSelectedUsers, user];
        }
    }

    // Remove user from selection
    function removeSelectedUser(user: User) {
        internalSelectedUsers = internalSelectedUsers.filter(
            (u) => u.id !== user.id,
        );
    }

    // Select a user (single select mode)
    function selectUser(user: User) {
        if (multiSelect) {
            toggleUserSelection(user);
        } else {
            dispatch("select", user);
            close();
        }
    }

    // Confirm multi-selection
    function confirmSelection() {
        dispatch("select", internalSelectedUsers);
        dispatchDOMEvent(internalSelectedUsers);
        close();
    }

    // Close dialog
    function close() {
        isOpen = false;
        searchQuery = "";
        filteredUsers = [];
        if (!multiSelect) {
            internalSelectedUsers = [];
        }
        dispatch("close");
    }

    // Handle overlay click
    function handleOverlayClick(event: MouseEvent) {
        if (event.target === dialogElement) {
            close();
        }
    }

    // Handle escape key
    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Escape" && isOpen) {
            close();
        }
    }

    // Focus input when dialog opens and reset filtered users to show all
    $: if (isOpen && searchInputElement) {
        setTimeout(() => {
            searchInputElement?.focus();
        }, 100);
    }

    // Reset filtered users to show all when dialog opens
    $: if (isOpen && allUsers.length > 0) {
        filteredUsers = [...allUsers];
        searchQuery = "";
    }

    // Sync internal selected users when dialog opens in multi-select mode
    $: if (isOpen && multiSelect) {
        internalSelectedUsers = [...selectedUsers];
    }

    onMount(() => {
        loadUsers();
        document.addEventListener("keydown", handleKeydown);

        // Listen for external open events (from Astro pages)
        const handleOpenEvent = (event: CustomEvent) => {
            if (event.detail?.selectedUsers && multiSelect) {
                internalSelectedUsers = [...event.detail.selectedUsers];
            }
            isOpen = true;
        };

        window.addEventListener(
            "open-docente-dialog",
            handleOpenEvent as EventListener,
        );

        return () => {
            document.removeEventListener("keydown", handleKeydown);
            window.removeEventListener(
                "open-docente-dialog",
                handleOpenEvent as EventListener,
            );
        };
    });

    // Dispatch DOM event for Astro pages when selection is confirmed
    function dispatchDOMEvent(users: User[]) {
        window.dispatchEvent(
            new CustomEvent("select-docentes", {
                detail: users,
            }),
        );
    }

    // Expose methods for external use
    export function open() {
        isOpen = true;
    }

    export function refresh() {
        loadUsers();
    }
</script>

{#if isOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div
        class="search-dialog-overlay"
        bind:this={dialogElement}
        on:click={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-dialog-title"
        tabindex="-1"
    >
        <div class="search-dialog">
            <div class="search-dialog-header">
                <h3 id="search-dialog-title">{title}</h3>
                <button type="button" class="btn-close-dialog" on:click={close}
                    >&times;</button
                >
            </div>
            <div class="search-dialog-body">
                {#if multiSelect && internalSelectedUsers.length > 0}
                    <div class="selected-users-section">
                        <div class="selected-users-label">
                            Selecionados ({internalSelectedUsers.length}):
                        </div>
                        <div class="selected-users-list">
                            {#each internalSelectedUsers as user (user.id)}
                                <div class="selected-user-chip">
                                    <span>{user.nome}</span>
                                    <button
                                        type="button"
                                        class="btn-remove-chip"
                                        on:click={() =>
                                            removeSelectedUser(user)}
                                        >&times;</button
                                    >
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
                <div class="search-input-wrapper">
                    <span class="search-icon">🔍</span>
                    <input
                        type="text"
                        bind:this={searchInputElement}
                        value={searchQuery}
                        on:input={handleSearchInput}
                        {placeholder}
                        autocomplete="off"
                    />
                </div>
                <div class="search-results">
                    {#if isLoading}
                        <div class="search-loading">Carregando usuários...</div>
                    {:else if filteredUsers.length === 0}
                        <div class="search-empty">
                            Nenhum usuário encontrado
                        </div>
                    {:else}
                        {#each filteredUsers as user (user.id)}
                            <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
                            <div
                                class="search-result-item"
                                class:selected={multiSelect &&
                                    isUserSelected(user)}
                                on:click={() => selectUser(user)}
                                role="option"
                                aria-selected={multiSelect &&
                                    isUserSelected(user)}
                                tabindex="0"
                            >
                                {#if multiSelect}
                                    <div class="checkbox-wrapper">
                                        <input
                                            type="checkbox"
                                            checked={isUserSelected(user)}
                                            on:click|stopPropagation={() =>
                                                toggleUserSelection(user)}
                                        />
                                    </div>
                                {/if}
                                <div class="result-info">
                                    <div class="result-name">{user.nome}</div>
                                    <div class="result-details">
                                        {user.email || "Sem email"}
                                    </div>
                                </div>
                                <span class="result-role {user.role}"
                                    >{user.role}</span
                                >
                                {#if !multiSelect}
                                    <button
                                        type="button"
                                        class="btn-select-user"
                                        on:click|stopPropagation={() =>
                                            selectUser(user)}
                                    >
                                        Selecionar
                                    </button>
                                {/if}
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
            {#if multiSelect}
                <div class="search-dialog-footer">
                    <button type="button" class="btn-cancel" on:click={close}
                        >Cancelar</button
                    >
                    <button
                        type="button"
                        class="btn-confirm"
                        on:click={confirmSelection}
                    >
                        Confirmar ({internalSelectedUsers.length})
                    </button>
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
    .search-dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .search-dialog {
        background-color: #ffffff;
        border-radius: 12px;
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }

    .search-dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid #cbd5e0;
    }

    .search-dialog-header h3 {
        margin: 0;
        font-size: 1.25rem;
        color: #2d3748;
    }

    .btn-close-dialog {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #718096;
        padding: 0.25rem;
        line-height: 1;
    }

    .btn-close-dialog:hover {
        color: #2d3748;
    }

    .search-dialog-body {
        padding: 1.5rem;
        flex: 1;
        overflow-y: auto;
    }

    .search-input-wrapper {
        position: relative;
        margin-bottom: 1rem;
    }

    .search-input-wrapper input {
        width: 100%;
        padding: 0.875rem 1rem 0.875rem 2.75rem;
        border: 1px solid #cbd5e0;
        border-radius: 8px;
        font-size: 1rem;
        color: #2d3748;
        background-color: #fdfdfd;
        box-sizing: border-box;
    }

    .search-input-wrapper input:focus {
        outline: none;
        border-color: #3182ce;
        box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.2);
    }

    .search-input-wrapper .search-icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: #718096;
    }

    .search-results {
        max-height: 300px;
        overflow-y: auto;
    }

    .search-result-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border: 1px solid #cbd5e0;
        border-radius: 8px;
        margin-bottom: 0.5rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .search-result-item:hover {
        background-color: #f7fafc;
        border-color: #3182ce;
    }

    .result-info {
        flex: 1;
    }

    .result-name {
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 0.25rem;
    }

    .result-details {
        font-size: 0.85rem;
        color: #718096;
    }

    .result-role {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: uppercase;
        margin-right: 0.75rem;
    }

    .result-role.responsavel {
        background-color: #e9d8fd;
        color: #6b46c1;
    }

    .result-role.docente {
        background-color: #c6f6d5;
        color: #2f855a;
    }

    .result-role.admin {
        background-color: #fed7d7;
        color: #c53030;
    }

    .btn-select-user {
        padding: 0.5rem 1rem;
        background-color: #3182ce;
        color: #ffffff;
        border: none;
        border-radius: 6px;
        font-size: 0.85rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .btn-select-user:hover {
        background-color: #2c5282;
    }

    .search-loading,
    .search-empty {
        text-align: center;
        padding: 2rem;
        color: #718096;
    }

    /* Multi-select styles */
    .selected-users-section {
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e2e8f0;
    }

    .selected-users-label {
        font-size: 0.85rem;
        color: #718096;
        margin-bottom: 0.5rem;
        font-weight: 500;
    }

    .selected-users-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .selected-user-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.375rem 0.75rem;
        background-color: #ebf8ff;
        border: 1px solid #90cdf4;
        border-radius: 20px;
        font-size: 0.85rem;
        color: #2b6cb0;
    }

    .btn-remove-chip {
        background: none;
        border: none;
        color: #4299e1;
        cursor: pointer;
        font-size: 1rem;
        line-height: 1;
        padding: 0;
        margin-left: 0.25rem;
    }

    .btn-remove-chip:hover {
        color: #c53030;
    }

    .checkbox-wrapper {
        margin-right: 0.75rem;
    }

    .checkbox-wrapper input[type="checkbox"] {
        width: 18px;
        height: 18px;
        accent-color: #3182ce;
        cursor: pointer;
    }

    .search-result-item.selected {
        background-color: #ebf8ff;
        border-color: #3182ce;
    }

    .search-dialog-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        border-top: 1px solid #cbd5e0;
        background-color: #f7fafc;
        border-radius: 0 0 12px 12px;
    }

    .btn-cancel {
        padding: 0.625rem 1.25rem;
        background-color: #e2e8f0;
        color: #4a5568;
        border: none;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .btn-cancel:hover {
        background-color: #cbd5e0;
    }

    .btn-confirm {
        padding: 0.625rem 1.25rem;
        background-color: #3182ce;
        color: #ffffff;
        border: none;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .btn-confirm:hover {
        background-color: #2c5282;
    }
</style>
