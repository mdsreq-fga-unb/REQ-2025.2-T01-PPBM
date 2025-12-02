<script lang="ts">
    import { createEventDispatcher } from "svelte";

    export let email: string;
    export let userName: string;
    export let role: "admin" | "docente" | "responsavel";
    export let disabled: boolean = false;

    const dispatch = createEventDispatcher();

    let currentRole = role;
    let isLoading = false;

    const roleOptions = {
        admin: { label: "🔴 Admin (protegido)", color: "admin" },
        docente: { label: "🔵 Docente", color: "docente" },
        responsavel: { label: "🟢 Responsável", color: "responsavel" },
    };

    function handleChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        const newRole = target.value as typeof role;

        if (newRole !== role) {
            dispatch("roleChange", {
                email,
                userName,
                originalRole: role,
                newRole,
                revert: () => {
                    currentRole = role;
                },
            });
        }
        currentRole = newRole;
    }

    export function setLoading(loading: boolean) {
        isLoading = loading;
    }

    export function revertRole() {
        currentRole = role;
    }

    export function confirmRole(newRole: typeof role) {
        role = newRole;
        currentRole = newRole;
    }
</script>

<select
    class="role-select {currentRole}"
    class:loading={isLoading}
    data-email={email}
    data-user-name={userName}
    data-original-role={role}
    disabled={disabled || isLoading}
    bind:value={currentRole}
    on:change={handleChange}
>
    {#if role === "admin"}
        <option value="admin" selected>🔴 Admin (protegido)</option>
    {:else}
        <option value="docente">🔵 Docente</option>
        <option value="responsavel">🟢 Responsável</option>
    {/if}
</select>

<style>
    .role-select {
        padding: 0.75rem;
        border: 1px solid var(--border-color, #cbd5e0);
        border-radius: 6px;
        font-size: 1rem;
        color: var(--text-color, #2d3748);
        background-color: #fdfdfd;
        cursor: pointer;
        min-width: 150px;
        font-weight: 500;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23718096' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 0.75rem center;
        padding-right: 2.5rem;
        transition:
            border-color 0.2s,
            box-shadow 0.2s;
    }

    .role-select:focus {
        outline: none;
        border-color: #3182ce;
        box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.2);
    }

    .role-select:disabled {
        background-color: #edf2f7;
        cursor: not-allowed;
        color: #718096;
    }

    .role-select.admin {
        background-color: #fed7d7;
        border-color: #fc8181;
        color: #c53030;
    }

    .role-select.docente {
        background-color: #bee3f8;
        border-color: #63b3ed;
        color: #2b6cb0;
    }

    .role-select.responsavel {
        background-color: #c6f6d5;
        border-color: #68d391;
        color: #2f855a;
    }

    .role-select.loading {
        opacity: 0.6;
        pointer-events: none;
    }
</style>
