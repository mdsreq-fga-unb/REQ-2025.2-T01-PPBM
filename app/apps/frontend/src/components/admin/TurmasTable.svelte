<script lang="ts">
    import { onMount } from 'svelte';
    import DataTable from '../ui/DataTable.svelte';
    import type { Column } from '../../interfaces/table';

    export let apiUrl: string = '';

    interface Turma {
        id_turma: number;
        nome_turma: string;
        unidade_turma: string;
        cidade_turma: string;
        limite_alunos_turma: number;
        alunos_count?: number;
    }

    let turmasData: Turma[] = [];
    let filteredTurmas: Turma[] = [];
    let loading = true;
    let errorMessage = '';

    // Filter state
    let searchTerm = '';
    let unidadeFilter = '';
    let cidadeFilter = '';

    // Stats
    $: stats = {
        totalTurmas: turmasData.length,
        totalVagas: turmasData.reduce((acc, turma) => acc + (turma.limite_alunos_turma || 0), 0),
        totalUnidades: new Set(turmasData.map(t => t.unidade_turma).filter(Boolean)).size
    };

    // Unidade mapping
    const unidadeMap: Record<string, string> = {
        'gama': 'Gama',
        'santa_maria': 'Santa Maria',
        'recanto': 'Recanto das Emas',
        'samambaia': 'Samambaia',
        'nucleo_bandeirante': 'Núcleo Bandeirante',
        'estrutural': 'Cidade Estrutural',
        'ceilandia': 'Ceilândia',
        'brazlandia': 'Brazlândia',
        'sobradinho': 'Sobradinho',
        'planaltina': 'Planaltina',
        'paranoa': 'Paranoá',
        'sao_sebastiao': 'São Sebastião'
    };

    function formatUnidade(unidade: string | null): string {
        if (!unidade) return '-';
        return unidadeMap[unidade.toLowerCase()] || unidade;
    }

    // Define table columns
    const columns: Column[] = [
        {
            key: 'turma',
            label: 'Turma',
            sortable: true,
            render: (row: Turma) => ({
                component: 'html',
                props: {
                    html: `
                        <div class="turma-info">
                            <span class="turma-name">${row.nome_turma || 'Sem nome'}</span>
                            <span class="turma-id">ID: ${row.id_turma}</span>
                        </div>
                    `
                }
            })
        },
        {
            key: 'unidade',
            label: 'Unidade',
            sortable: true,
            render: (row: Turma) => formatUnidade(row.unidade_turma)
        },
        {
            key: 'cidade',
            label: 'Cidade',
            sortable: true,
            render: (row: Turma) => row.cidade_turma || '-'
        },
        {
            key: 'capacidade',
            label: 'Capacidade',
            sortable: true,
            render: (row: Turma) => {
                const limite = row.limite_alunos_turma || 0;
                const count = row.alunos_count || 0;
                const percentage = limite > 0 ? (count / limite) * 100 : 0;
                
                let variant = 'success';
                if (percentage >= 100) {
                    variant = 'danger';
                } else if (percentage >= 80) {
                    variant = 'warning';
                }
                
                return {
                    component: 'badge',
                    props: {
                        variant,
                        text: `${limite} vagas`
                    }
                };
            }
        },
        {
            key: 'acoes',
            label: 'Ações',
            width: 'min',
            render: (row: Turma) => [
                {
                    component: 'button',
                    props: {
                        variant: 'primary',
                        text: 'Editar',
                        onClick: () => editarTurma(row.id_turma)
                    }
                },
                {
                    component: 'button',
                    props: {
                        variant: 'danger',
                        text: 'Remover',
                        onClick: () => removerTurma(row.id_turma)
                    }
                }
            ]
        }
    ];

    // Map rows with id field for the DataTable
    $: tableRows = filteredTurmas.map(turma => ({
        ...turma,
        id: turma.id_turma
    }));

    async function getAuthToken(): Promise<string | null> {
        return localStorage.getItem('bm_token');
    }

    async function loadTurmas() {
        loading = true;
        errorMessage = '';

        try {
            const token = await getAuthToken();
            const response = await fetch(`${apiUrl}/turmas/listar?pageSize=100`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Erro ao carregar turmas');
            }

            const apiData = data.data;
            turmasData = apiData.data || apiData || [];
            applyFilters();
        } catch (error) {
            console.error('Erro ao carregar turmas:', error);
            errorMessage = error instanceof Error ? error.message : 'Erro ao carregar turmas';
        } finally {
            loading = false;
        }
    }

    function applyFilters() {
        filteredTurmas = turmasData.filter((turma) => {
            const matchSearch = !searchTerm || 
                (turma.nome_turma && turma.nome_turma.toLowerCase().includes(searchTerm.toLowerCase())) ||
                String(turma.id_turma).includes(searchTerm);
            
            const matchUnidade = !unidadeFilter || 
                (turma.unidade_turma && turma.unidade_turma.toLowerCase().includes(unidadeFilter.toLowerCase()));
            
            const matchCidade = !cidadeFilter || 
                (turma.cidade_turma && turma.cidade_turma.toLowerCase().includes(cidadeFilter.toLowerCase()));

            return matchSearch && matchUnidade && matchCidade;
        });
    }

    // Watch for filter changes
    $: {
        searchTerm;
        unidadeFilter;
        cidadeFilter;
        applyFilters();
    }

    function editarTurma(id: number) {
        // Navigate to edit page or open modal
        window.location.href = `/admin/editar-turma/${id}`;
    }

    async function removerTurma(id: number) {
        if (!confirm('Tem certeza que deseja remover esta turma? Esta ação não pode ser desfeita.')) {
            return;
        }

        try {
            const token = await getAuthToken();
            const response = await fetch(`${apiUrl}/turmas/deletar/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Erro ao remover turma');
            }

            alert('Turma removida com sucesso!');
            await loadTurmas();
        } catch (error) {
            console.error('Erro ao remover turma:', error);
            alert(error instanceof Error ? error.message : 'Erro ao remover turma. Por favor, tente novamente.');
        }
    }

    function exportarLista() {
        if (filteredTurmas.length === 0) {
            alert('Nenhuma turma para exportar.');
            return;
        }

        const dados = filteredTurmas.map((turma) => ({
            ID: turma.id_turma,
            Nome: turma.nome_turma || '',
            Unidade: formatUnidade(turma.unidade_turma),
            Cidade: turma.cidade_turma || '',
            'Limite de Alunos': turma.limite_alunos_turma || 0
        }));

        // Convert to CSV
        const headers = Object.keys(dados[0]);
        const csvContent = [
            headers.join(','),
            ...dados.map((row: any) => headers.map(header => `"${row[header]}"`).join(','))
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `turmas_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    onMount(() => {
        loadTurmas();

        // Expose functions for external use
        (window as any).exportarTurmas = exportarLista;
    });
</script>

<div class="turmas-manager">
    <!-- Stats Row -->
    <div class="stats-row">
        <div class="stat-card">
            <div class="stat-value">{stats.totalTurmas}</div>
            <div class="stat-label">Total de Turmas</div>
        </div>
        <div class="stat-card secondary">
            <div class="stat-value">{stats.totalVagas}</div>
            <div class="stat-label">Total de Vagas</div>
        </div>
        <div class="stat-card tertiary">
            <div class="stat-value">{stats.totalUnidades}</div>
            <div class="stat-label">Unidades</div>
        </div>
    </div>

    {#if errorMessage}
        <div class="error-state">
            {errorMessage}
        </div>
    {/if}

    <!-- Filters -->
    <div class="filters-section">
        <div class="filter-group full-width">
            <label for="buscar">Buscar turma</label>
            <input 
                type="text" 
                id="buscar" 
                bind:value={searchTerm}
                placeholder="Nome da turma..."
            >
        </div>
        <div class="filter-group">
            <label for="unidade">Filtrar por unidade</label>
            <select id="unidade" bind:value={unidadeFilter}>
                <option value="">Todas as unidades</option>
                <option value="gama">Gama</option>
                <option value="santa_maria">Santa Maria</option>
                <option value="recanto">Recanto das Emas</option>
                <option value="samambaia">Samambaia</option>
                <option value="nucleo_bandeirante">Núcleo Bandeirante</option>
                <option value="estrutural">Cidade Estrutural</option>
                <option value="ceilandia">Ceilândia</option>
                <option value="brazlandia">Brazlândia</option>
                <option value="sobradinho">Sobradinho</option>
                <option value="planaltina">Planaltina</option>
                <option value="paranoa">Paranoá</option>
                <option value="sao_sebastiao">São Sebastião</option>
            </select>
        </div>
        <div class="filter-group">
            <label for="cidade">Filtrar por cidade</label>
            <input 
                type="text" 
                id="cidade" 
                bind:value={cidadeFilter}
                placeholder="Nome da cidade..."
            >
        </div>
    </div>

    <!-- Table -->
    <DataTable 
        {columns}
        rows={tableRows}
        {loading}
        keyField="id"
        emptyMessage="Nenhuma turma encontrada com os filtros selecionados."
        loadingMessage="Carregando turmas..."
    />
</div>

<style>
    .turmas-manager {
        width: 100%;
    }

    .stats-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .stat-card {
        background: linear-gradient(135deg, #3182ce, #2c5282);
        color: white;
        padding: 1.25rem;
        border-radius: 12px;
        text-align: center;
    }

    .stat-card.secondary {
        background: linear-gradient(135deg, #48bb78, #276749);
    }

    .stat-card.tertiary {
        background: linear-gradient(135deg, #ed8936, #c05621);
    }

    .stat-value {
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 0.25rem;
    }

    .stat-label {
        font-size: 0.85rem;
        opacity: 0.9;
    }

    .error-state {
        text-align: center;
        padding: 2rem 1rem;
        color: #c53030;
        background-color: #fed7d7;
        border-radius: 8px;
        margin-bottom: 1rem;
    }

    .filters-section {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
    }

    .filter-group {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 200px;
    }

    .filter-group.full-width {
        flex: 2;
    }

    .filter-group label {
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
        color: #718096;
        font-weight: 500;
    }

    .filter-group input,
    .filter-group select {
        padding: 0.75rem;
        border: 1px solid #cbd5e0;
        border-radius: 6px;
        font-size: 1rem;
        color: #2d3748;
        background-color: #fdfdfd;
    }

    .filter-group input:focus,
    .filter-group select:focus {
        outline: none;
        border-color: #3182ce;
        box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.2);
    }

    /* Custom styles for turma info in table */
    :global(.turma-info) {
        display: flex;
        flex-direction: column;
    }

    :global(.turma-name) {
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 0.25rem;
    }

    :global(.turma-id) {
        font-size: 0.85rem;
        color: #718096;
    }

    @media (max-width: 768px) {
        .filters-section {
            flex-direction: column;
        }

        .filter-group {
            width: 100%;
        }
    }
</style>
