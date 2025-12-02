<script lang="ts">
    import { onMount } from 'svelte';
    import Toast from '../ui/Toast.svelte';

    export let apiUrl: string = '';

    interface Aluno {
        id: number;
        nome: string;
        observacoes?: string;
    }

    interface Turma {
        id_turma: number;
        nome_turma: string;
    }

    interface Sessao {
        id: number;
        nome: string;
    }

    interface PresencaStatus {
        aluno_id: number;
        status: 'present' | 'late' | 'absent' | null;
        observacoes: string;
    }

    let turmas: Turma[] = [];
    let sessoes: Sessao[] = [
        { id: 1, nome: 'Sessão 1 - 08:00' },
        { id: 2, nome: 'Sessão 2 - 14:00' }
    ];
    let alunos: Aluno[] = [];
    let presencas: Map<number, PresencaStatus> = new Map();

    let selectedTurma = '';
    let selectedSessao = '';
    let selectedData = '';
    let loading = false;
    let loadingAlunos = false;
    let saving = false;

    // Stats
    let stats = {
        total: 0,
        presentes: 0,
        atrasos: 0,
        faltas: 0
    };

    // Toast state
    let toastMessage = '';
    let toastType: 'success' | 'error' | 'warning' | 'info' = 'info';
    let showToast = false;

    function displayToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
        toastMessage = message;
        toastType = type;
        showToast = true;
    }

    async function getAuthToken(): Promise<string | null> {
        return localStorage.getItem('bm_token');
    }

    async function loadTurmas() {
        try {
            const token = await getAuthToken();
            const response = await fetch(`${apiUrl}/turmas/listar`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success && data.turmas) {
                turmas = data.turmas;
            }
        } catch (error) {
            console.error('Erro ao carregar turmas:', error);
            displayToast('Erro ao carregar turmas', 'error');
        }
    }

    async function loadAlunos() {
        if (!selectedTurma || !selectedSessao || !selectedData) {
            alunos = [];
            presencas = new Map();
            updateStats();
            return;
        }

        loadingAlunos = true;
        try {
            const token = await getAuthToken();
            const response = await fetch(`${apiUrl}/alunos/por-turma/${selectedTurma}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success && data.alunos) {
                alunos = data.alunos.map((a: any) => ({
                    id: a.id_aluno,
                    nome: a.nome_aluno,
                    observacoes: ''
                }));
                
                // Initialize presencas for each aluno
                presencas = new Map();
                alunos.forEach(aluno => {
                    presencas.set(aluno.id, {
                        aluno_id: aluno.id,
                        status: null,
                        observacoes: ''
                    });
                });
                presencas = presencas; // Trigger reactivity
                updateStats();
            } else {
                alunos = [];
                presencas = new Map();
            }
        } catch (error) {
            console.error('Erro ao carregar alunos:', error);
            displayToast('Erro ao carregar alunos da turma', 'error');
            alunos = [];
        } finally {
            loadingAlunos = false;
        }
    }

    function setStatus(alunoId: number, status: 'present' | 'late' | 'absent') {
        const current = presencas.get(alunoId);
        if (current) {
            // Toggle off if same status clicked
            if (current.status === status) {
                current.status = null;
            } else {
                current.status = status;
            }
            presencas.set(alunoId, current);
            presencas = presencas; // Trigger reactivity
            updateStats();
        }
    }

    function updateObservacoes(alunoId: number, observacoes: string) {
        const current = presencas.get(alunoId);
        if (current) {
            current.observacoes = observacoes;
            presencas.set(alunoId, current);
        }
    }

    function updateStats() {
        stats.total = alunos.length;
        stats.presentes = 0;
        stats.atrasos = 0;
        stats.faltas = 0;

        presencas.forEach(p => {
            if (p.status === 'present') stats.presentes++;
            else if (p.status === 'late') stats.atrasos++;
            else if (p.status === 'absent') stats.faltas++;
        });

        stats = stats; // Trigger reactivity
    }

    async function salvarPresencas() {
        if (!selectedTurma || !selectedSessao || !selectedData) {
            displayToast('Por favor, preencha todos os campos', 'warning');
            return;
        }

        if (alunos.length === 0) {
            displayToast('Nenhum aluno encontrado', 'warning');
            return;
        }

        // Check if all students have a status
        let allMarked = true;
        presencas.forEach(p => {
            if (p.status === null) allMarked = false;
        });

        if (!allMarked) {
            displayToast('Por favor, marque a presença de todos os alunos', 'warning');
            return;
        }

        saving = true;
        try {
            const token = await getAuthToken();
            const presencasData = Array.from(presencas.values()).map(p => ({
                aluno_id: p.aluno_id,
                status: p.status,
                observacoes: p.observacoes
            }));

            const response = await fetch(`${apiUrl}/presencas/registrar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    turma_id: selectedTurma,
                    sessao_id: selectedSessao,
                    data: selectedData,
                    presencas: presencasData
                })
            });

            const data = await response.json();
            if (data.success) {
                displayToast('Presenças salvas com sucesso!', 'success');
            } else {
                throw new Error(data.error || 'Erro ao salvar presenças');
            }
        } catch (error) {
            console.error('Erro ao salvar presenças:', error);
            displayToast(error instanceof Error ? error.message : 'Erro ao salvar presenças. Tente novamente.', 'error');
        } finally {
            saving = false;
        }
    }

    $: if (selectedTurma && selectedSessao && selectedData) {
        loadAlunos();
    }

    onMount(() => {
        // Set default date to today
        const hoje = new Date();
        selectedData = hoje.toISOString().split('T')[0];
        loadTurmas();
    });
</script>

<div class="controle-presencas">
    <div class="page-header">
        <h1>Controle de Presenças</h1>
        <p>Registre a presença dos alunos</p>
    </div>

    <form on:submit|preventDefault={salvarPresencas}>
        <div class="form-controls">
            <div class="form-group">
                <label for="data">Data</label>
                <div class="date-input-wrapper">
                    <input type="date" id="data" bind:value={selectedData}>
                    <span class="date-icon">📅</span>
                </div>
            </div>
            <div class="form-group">
                <label for="turma">Turma</label>
                <select id="turma" bind:value={selectedTurma} required>
                    <option value="">Selecione uma turma</option>
                    {#each turmas as turma}
                        <option value={turma.id_turma}>{turma.nome_turma}</option>
                    {/each}
                </select>
            </div>
            <div class="form-group">
                <label for="sessao">Sessão</label>
                <select id="sessao" bind:value={selectedSessao} required>
                    <option value="">Selecione uma sessão</option>
                    {#each sessoes as sessao}
                        <option value={sessao.id}>{sessao.nome}</option>
                    {/each}
                </select>
            </div>
            <button type="submit" class="btn-save" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Presenças'}
            </button>
        </div>
    </form>

    <!-- Stats Grid -->
    {#if alunos.length > 0}
        <div class="stats-grid">
            <div class="stat-card total">
                <h3>Total de Alunos</h3>
                <p class="value">{stats.total}</p>
            </div>
            <div class="stat-card present">
                <h3>Presentes</h3>
                <p class="value">{stats.presentes}</p>
            </div>
            <div class="stat-card late">
                <h3>Atrasos</h3>
                <p class="value">{stats.atrasos}</p>
            </div>
            <div class="stat-card absent">
                <h3>Faltas</h3>
                <p class="value">{stats.faltas}</p>
            </div>
        </div>
    {/if}

    <div class="table-container">
        {#if loadingAlunos}
            <div class="empty-state">Carregando alunos...</div>
        {:else if !selectedTurma || !selectedSessao || !selectedData}
            <div class="empty-state">Selecione a data, turma e sessão</div>
        {:else if alunos.length === 0}
            <div class="empty-state">Nenhum aluno encontrado nesta turma</div>
        {:else}
            <div class="table-header">
                <div>Aluno</div>
                <div>Presente</div>
                <div>Atraso</div>
                <div>Falta</div>
                <div>Observações</div>
            </div>
            <div class="table-body">
                {#each alunos as aluno}
                    {@const presenca = presencas.get(aluno.id)}
                    <div class="table-row">
                        <div class="student-info">
                            <div class="student-name">{aluno.nome}</div>
                        </div>
                        <div class="status-checkbox-wrapper">
                            <input 
                                type="checkbox" 
                                class="status-checkbox status-presente" 
                                checked={presenca?.status === 'present'}
                                on:change={() => setStatus(aluno.id, 'present')}
                            >
                        </div>
                        <div class="status-checkbox-wrapper">
                            <input 
                                type="checkbox" 
                                class="status-checkbox status-atraso" 
                                checked={presenca?.status === 'late'}
                                on:change={() => setStatus(aluno.id, 'late')}
                            >
                        </div>
                        <div class="status-checkbox-wrapper">
                            <input 
                                type="checkbox" 
                                class="status-checkbox status-falta" 
                                checked={presenca?.status === 'absent'}
                                on:change={() => setStatus(aluno.id, 'absent')}
                            >
                        </div>
                        <div>
                            <textarea 
                                class="observations-textarea" 
                                placeholder="Observações..."
                                value={presenca?.observacoes || ''}
                                on:input={(e) => updateObservacoes(aluno.id, e.currentTarget.value)}
                            ></textarea>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

<!-- Toast notifications -->
<Toast 
    bind:show={showToast} 
    message={toastMessage} 
    type={toastType} 
/>

<style>
    .controle-presencas {
        width: 100%;
    }

    .page-header {
        margin-bottom: 2rem;
        padding-bottom: 1.5rem;
        border-bottom: 2px solid #E2E8F0;
    }

    .page-header h1 {
        font-size: 1.8rem;
        margin: 0 0 0.5rem 0;
        color: #2D3748;
    }

    .page-header p {
        font-size: 1rem;
        margin: 0;
        color: #718096;
    }

    .form-controls {
        display: flex;
        gap: 1rem;
        align-items: flex-end;
        margin-bottom: 2rem;
        flex-wrap: wrap;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 200px;
    }

    .form-group label {
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
        color: #718096;
        font-weight: 500;
    }

    .form-group select,
    .form-group input {
        padding: 0.75rem;
        border: 1px solid #CBD5E0;
        border-radius: 6px;
        font-size: 1rem;
        color: #2D3748;
        background-color: #FDFDFD;
    }

    .form-group select:focus,
    .form-group input:focus {
        outline: none;
        border-color: #3182CE;
        box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.2);
    }

    .date-input-wrapper {
        position: relative;
    }

    .date-icon {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        color: #718096;
    }

    .btn-save {
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        border: none;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.3s;
        background-color: #E53E3E;
        color: white;
        white-space: nowrap;
    }

    .btn-save:hover:not(:disabled) {
        background-color: #C53030;
    }

    .btn-save:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    .stat-card {
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        text-align: center;
    }

    .stat-card.total {
        background: linear-gradient(135deg, #4299E1 0%, #2B6CB0 100%);
        color: white;
    }

    .stat-card.present {
        background: linear-gradient(135deg, #48BB78 0%, #2F855A 100%);
        color: white;
    }

    .stat-card.late {
        background: linear-gradient(135deg, #ED8936 0%, #C05621 100%);
        color: white;
    }

    .stat-card.absent {
        background: linear-gradient(135deg, #E53E3E 0%, #C53030 100%);
        color: white;
    }

    .stat-card h3 {
        font-size: 0.9rem;
        margin: 0 0 0.5rem 0;
        font-weight: 500;
        opacity: 0.9;
    }

    .stat-card .value {
        font-size: 2.5rem;
        font-weight: 700;
        margin: 0;
    }

    .table-container {
        margin-top: 2rem;
    }

    .table-header {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr 2fr;
        gap: 1rem;
        padding: 1rem;
        background-color: #E2E8F0;
        border-radius: 8px 8px 0 0;
        font-weight: 600;
        color: #2D3748;
    }

    .table-body {
        border: 1px solid #CBD5E0;
        border-top: none;
        border-radius: 0 0 8px 8px;
    }

    .table-row {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr 2fr;
        gap: 1rem;
        padding: 1rem;
        border-bottom: 1px solid #CBD5E0;
        align-items: center;
    }

    .table-row:last-child {
        border-bottom: none;
    }

    .table-row:hover {
        background-color: #F7FAFC;
    }

    .empty-state {
        text-align: center;
        padding: 3rem 1rem;
        color: #718096;
        font-size: 1rem;
    }

    .student-info {
        display: flex;
        flex-direction: column;
    }

    .student-name {
        font-weight: 600;
        color: #2D3748;
        margin-bottom: 0.25rem;
    }

    .status-checkbox-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }

    .status-checkbox {
        width: 20px;
        height: 20px;
        cursor: pointer;
        accent-color: #3182CE;
    }

    .observations-textarea {
        width: 100%;
        min-height: 80px;
        padding: 0.75rem;
        border: 1px solid #CBD5E0;
        border-radius: 6px;
        font-size: 0.95rem;
        color: #2D3748;
        background-color: #FDFDFD;
        font-family: inherit;
        resize: vertical;
    }

    .observations-textarea:focus {
        outline: none;
        border-color: #3182CE;
        box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.2);
    }

    .observations-textarea::placeholder {
        color: #718096;
    }

    @media (max-width: 768px) {
        .form-controls {
            flex-direction: column;
        }

        .form-group {
            width: 100%;
        }

        .btn-save {
            width: 100%;
        }

        .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
        }

        .table-header {
            display: none;
        }

        .table-row {
            grid-template-columns: 1fr;
            gap: 0.5rem;
            border: 1px solid #CBD5E0;
            border-radius: 8px;
            margin-bottom: 1rem;
        }
    }

    @media (max-width: 480px) {
        .page-header h1 {
            font-size: 1.25rem;
        }

        .stats-grid {
            grid-template-columns: 1fr;
        }

        .stat-card .value {
            font-size: 2rem;
        }
    }
</style>
