<script lang="ts">
    import ResponsavelForm from './ResponsavelForm.svelte';

    export let maxResponsaveis: number = 3;

    let responsaveis = [{ id: 0 }];
    let nextId = 1;

    function addResponsavel() {
        if (responsaveis.length >= maxResponsaveis) {
            alert(`Máximo de ${maxResponsaveis} responsáveis permitido.`);
            return;
        }
        responsaveis = [...responsaveis, { id: nextId }];
        nextId++;
    }

    function removeResponsavel(index: number) {
        responsaveis = responsaveis.filter((_, i) => i !== index);
    }
</script>

<section class="form-section">
    <h2>👨‍👩‍👧 Responsáveis</h2>
    
    <div class="responsaveis-section">
        <div class="responsaveis-header">
            <h3>Responsáveis do Aluno</h3>
            {#if responsaveis.length < maxResponsaveis}
                <button type="button" class="btn-add-responsavel" on:click={addResponsavel}>
                    <span>+</span> Adicionar Responsável
                </button>
            {/if}
        </div>
        
        <div class="responsaveis-list">
            {#each responsaveis as resp, index (resp.id)}
                <ResponsavelForm 
                    {index}
                    isPrimary={index === 0}
                    onRemove={index > 0 ? () => removeResponsavel(index) : null}
                />
            {/each}
        </div>
    </div>
</section>

<style>
    .form-section {
        margin-bottom: 2rem;
    }

    .form-section h2 {
        font-size: 1.2rem;
        color: #2d3748;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #e2e8f0;
    }

    .responsaveis-section {
        background-color: #F8FAFC;
        padding: 1.5rem;
        border-radius: 8px;
        border: 1px solid #cbd5e0;
    }

    .responsaveis-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .responsaveis-header h3 {
        margin: 0;
        font-size: 1rem;
        color: #2d3748;
    }

    .responsaveis-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .btn-add-responsavel {
        padding: 0.5rem 1rem;
        background-color: #3182ce;
        color: #ffffff;
        border: none;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
    }

    .btn-add-responsavel:hover {
        background-color: #2c5282;
    }

    @media (max-width: 768px) {
        .responsaveis-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
        }

        .btn-add-responsavel {
            width: 100%;
            justify-content: center;
        }
    }
</style>
