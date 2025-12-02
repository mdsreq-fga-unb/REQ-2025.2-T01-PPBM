<script lang="ts">
    import { onMount } from "svelte";

    export let message: string = "";
    export let type: "success" | "error" | "warning" | "info" = "info";
    export let duration: number = 3000;
    export let show: boolean = false;

    let timeoutId: ReturnType<typeof setTimeout>;

    $: if (show && duration > 0) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            show = false;
        }, duration);
    }

    onMount(() => {
        return () => clearTimeout(timeoutId);
    });
</script>

{#if show}
    <div class="toast {type}" role="alert">
        <span class="toast-icon">
            {#if type === "success"}✓{:else if type === "error"}✕{:else if type === "warning"}⚠{:else}ℹ{/if}
        </span>
        <span class="toast-message">{message}</span>
        <button
            class="toast-close"
            on:click={() => (show = false)}
            aria-label="Fechar">×</button
        >
    </div>
{/if}

<style>
    .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .toast.success {
        background-color: #c6f6d5;
        color: #2f855a;
        border-left: 4px solid #48bb78;
    }

    .toast.error {
        background-color: #fed7d7;
        color: #c53030;
        border-left: 4px solid #e53e3e;
    }

    .toast.warning {
        background-color: #feebc8;
        color: #c05621;
        border-left: 4px solid #ed8936;
    }

    .toast.info {
        background-color: #bee3f8;
        color: #2b6cb0;
        border-left: 4px solid #4299e1;
    }

    .toast-icon {
        font-size: 1.25rem;
        font-weight: bold;
    }

    .toast-message {
        flex: 1;
        font-size: 0.95rem;
    }

    .toast-close {
        background: none;
        border: none;
        font-size: 1.25rem;
        cursor: pointer;
        opacity: 0.7;
        padding: 0;
        line-height: 1;
        color: inherit;
    }

    .toast-close:hover {
        opacity: 1;
    }
</style>
