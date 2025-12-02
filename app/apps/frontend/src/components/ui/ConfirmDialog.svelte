<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    
    export let show: boolean = false;
    export let title: string = 'Confirmar';
    export let message: string = 'Tem certeza que deseja continuar?';
    export let confirmText: string = 'Confirmar';
    export let cancelText: string = 'Cancelar';
    export let confirmVariant: 'primary' | 'danger' | 'warning' = 'primary';
    export let loading: boolean = false;
    
    const dispatch = createEventDispatcher<{
        confirm: void;
        cancel: void;
    }>();
    
    function handleConfirm() {
        dispatch('confirm');
    }
    
    function handleCancel() {
        dispatch('cancel');
        show = false;
    }
    
    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape' && !loading) {
            handleCancel();
        }
    }
    
    function handleOverlayClick(e: MouseEvent) {
        if (e.target === e.currentTarget && !loading) {
            handleCancel();
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
        class="modal-overlay" 
        on:click={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
    >
        <div class="modal">
            <h3 class="modal-title" id="dialog-title">{title}</h3>
            <div class="modal-message">
                {@html message}
            </div>
            <div class="modal-buttons">
                <button 
                    type="button" 
                    class="modal-btn modal-btn-cancel" 
                    on:click={handleCancel} 
                    disabled={loading}
                >
                    {cancelText}
                </button>
                <button 
                    type="button" 
                    class="modal-btn modal-btn-confirm {confirmVariant}" 
                    on:click={handleConfirm} 
                    disabled={loading}
                >
                    {#if loading}
                        <span class="spinner"></span>
                        Aguarde...
                    {:else}
                        {confirmText}
                    {/if}
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.2s ease-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .modal {
        background: white;
        padding: 1.5rem;
        border-radius: 12px;
        max-width: 420px;
        width: 90%;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        animation: scaleIn 0.2s ease-out;
    }
    
    @keyframes scaleIn {
        from {
            transform: scale(0.95);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }
    
    .modal-title {
        margin: 0 0 1rem 0;
        font-size: 1.25rem;
        color: #2D3748;
    }
    
    .modal-message {
        margin-bottom: 1.5rem;
        color: #4A5568;
        line-height: 1.5;
    }
    
    .modal-message :global(strong) {
        color: #2D3748;
    }
    
    .modal-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
    }
    
    .modal-btn {
        padding: 0.625rem 1.25rem;
        border-radius: 6px;
        font-size: 0.95rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .modal-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    .modal-btn-cancel {
        background: #E2E8F0;
        color: #4A5568;
    }
    
    .modal-btn-cancel:hover:not(:disabled) {
        background: #CBD5E0;
    }
    
    .modal-btn-confirm {
        color: white;
    }
    
    .modal-btn-confirm.primary {
        background: #3182CE;
    }
    
    .modal-btn-confirm.primary:hover:not(:disabled) {
        background: #2C5282;
    }
    
    .modal-btn-confirm.danger {
        background: #E53E3E;
    }
    
    .modal-btn-confirm.danger:hover:not(:disabled) {
        background: #C53030;
    }
    
    .modal-btn-confirm.warning {
        background: #ED8936;
    }
    
    .modal-btn-confirm.warning:hover:not(:disabled) {
        background: #C05621;
    }
    
    .spinner {
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
</style>
