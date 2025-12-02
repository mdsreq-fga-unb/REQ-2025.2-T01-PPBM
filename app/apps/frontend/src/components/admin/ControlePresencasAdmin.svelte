<script lang="ts">
    import { onMount } from "svelte";
    import Toast from "../ui/Toast.svelte";
    import FormSelect from "../ui/FormSelect.svelte";
    import JustificativaDialog from "../ui/JustificativaDialog.svelte";
    import { apiFetch } from "../../lib/api";

    interface Aluno {
        id_aluno: number;
        nome_aluno: string;
        neurodivergente: boolean;
    }

    interface Turma {
        id_turma: number;
        nome_turma: string;
        unidade_turma: string;
    }

    interface PresencaExistente {
        id_presenca: number;
        id_aluno: number;
        status_presenca: string;
        id_justificativa: number | null;
    }

    interface PresencaStatus {
        alunoId: number;
        presencaId: number | null;
        status: "Presente" | "Atraso" | "Falta";
        justificativaId: number | null;
    }

    let turmas: Turma[] = [];
    let alunosAtuais: Aluno[] = [];
    let presencas: Map<number, PresencaStatus> = new Map();

    let selectedTurma = "";
    let selectedData = "";
    let loading = false;
    let loadingAlunos = false;
    let saving = false;

    // Justificativa dialog state
    let showJustificativaDialog = false;
    let selectedJustificativaId: number | null = null;
    let selectedAlunoId: number | null = null;
    let selectedAlunoNome: string = "";
    let selectedPresencaId: number | null = null;

    // Stats
    $: stats = calculateStats();

    function calculateStats() {
        let presentes = 0;
        let atrasos = 0;
        let faltas = 0;

        presencas.forEach((p) => {
            switch (p.status) {
                case "Presente":
                    presentes++;
                    break;
                case "Atraso":
                    atrasos++;
                    break;
                case "Falta":
                    faltas++;
                    break;
            }
        });

        return {
            total: alunosAtuais.length,
            presentes,
            atrasos,
            faltas,
        };
    }

    // Toast state
    let toastMessage = "";
    let toastType: "success" | "error" | "warning" | "info" = "info";
    let showToast = false;

    function displayToast(
        message: string,
        type: "success" | "error" | "warning" | "info" = "info",
    ) {
        toastMessage = message;
        toastType = type;
        showToast = true;
    }

    async function loadTurmas() {
        loading = true;
        try {
            const response = await apiFetch<{ data: Turma[] }>(
                "/turmas/listar?pageSize=100",
            );

            if (!response.success)
                throw new Error(response.error || "Erro ao carregar turmas");

            turmas = response.data?.data || [];
        } catch (error) {
            console.error("Erro ao carregar turmas:", error);
            displayToast(
                "Erro ao carregar turmas. Verifique a conexão com o servidor.",
                "error",
            );
        } finally {
            loading = false;
        }
    }

    async function loadAlunosDaTurma(turmaId: string) {
        if (!turmaId) {
            alunosAtuais = [];
            presencas = new Map();
            return;
        }

        loadingAlunos = true;

        try {
            const response = await apiFetch<{ alunos: Aluno[] }>(
                `/turmas/${turmaId}/alunos`,
            );

            if (!response.success)
                throw new Error(response.error || "Erro ao carregar alunos");

            alunosAtuais = response.data?.alunos || [];

            // Load existing presences for this date
            await loadPresencasExistentes(turmaId, selectedData);

            // Initialize presencas map for new students
            alunosAtuais.forEach((aluno) => {
                if (!presencas.has(aluno.id_aluno)) {
                    presencas.set(aluno.id_aluno, {
                        alunoId: aluno.id_aluno,
                        presencaId: null,
                        status: "Presente",
                        justificativaId: null,
                    });
                }
            });
            presencas = presencas; // Trigger reactivity
        } catch (error) {
            console.error("Erro ao carregar alunos:", error);
            displayToast("Erro ao carregar alunos da turma.", "error");
        } finally {
            loadingAlunos = false;
        }
    }

    async function loadPresencasExistentes(turmaId: string, data: string) {
        if (!data) return;

        try {
            const dataInicio = `${data}T00:00:00`;
            const dataFim = `${data}T23:59:59`;

            const response = await apiFetch<{ data: PresencaExistente[] }>(
                `/presencas/listar?turmaId=${turmaId}&from=${dataInicio}&to=${dataFim}&pageSize=100`,
            );

            if (!response.success)
                throw new Error(response.error || "Erro ao carregar presenças");

            const presencasData: PresencaExistente[] =
                response.data?.data || [];

            // Create/update presencas map
            presencas = new Map();
            presencasData.forEach((p) => {
                presencas.set(p.id_aluno, {
                    alunoId: p.id_aluno,
                    presencaId: p.id_presenca,
                    status: p.status_presenca as
                        | "Presente"
                        | "Atraso"
                        | "Falta",
                    justificativaId: p.id_justificativa,
                });
            });
        } catch (error) {
            console.error("Erro ao carregar presenças existentes:", error);
        }
    }

    function handleTurmaChange() {
        if (selectedTurma && selectedData) {
            loadAlunosDaTurma(selectedTurma);
        } else {
            alunosAtuais = [];
            presencas = new Map();
        }
    }

    function handleDataChange(event: Event) {
        const target = event.target as HTMLInputElement;
        selectedData = target.value;
        if (selectedTurma && selectedData) {
            loadAlunosDaTurma(selectedTurma);
        }
    }

    function handleStatusChange(alunoId: number, newStatus: string) {
        const current = presencas.get(alunoId);
        if (current) {
            presencas.set(alunoId, {
                ...current,
                status: newStatus as "Presente" | "Atraso" | "Falta",
            });
            presencas = presencas; // Trigger reactivity
        }
    }

    function openJustificativaDialog(aluno: Aluno, presenca: PresencaStatus | undefined) {
        selectedAlunoId = aluno.id_aluno;
        selectedAlunoNome = aluno.nome_aluno;
        selectedPresencaId = presenca?.presencaId || null;
        selectedJustificativaId = presenca?.justificativaId || null;
        showJustificativaDialog = true;
    }

    function handleJustificativaSave(event: CustomEvent<{ justificativaId: number }>) {
        const { justificativaId } = event.detail;
        
        // Update the presenca in the map with the new justificativaId
        if (selectedAlunoId) {
            const current = presencas.get(selectedAlunoId);
            if (current) {
                presencas.set(selectedAlunoId, {
                    ...current,
                    justificativaId,
                });
                presencas = presencas; // Trigger reactivity
            }
        }
        
        displayToast("Justificativa salva com sucesso!", "success");
    }

    function getStatusClass(status: string): string {
        switch (status) {
            case "Presente":
                return "presente";
            case "Atraso":
                return "atraso";
            case "Falta":
                return "falta";
            default:
                return "";
        }
    }

    async function salvarPresencas() {
        if (!selectedTurma || alunosAtuais.length === 0) {
            displayToast("Selecione uma turma com alunos", "warning");
            return;
        }

        if (!selectedData) {
            displayToast("Selecione uma data", "warning");
            return;
        }

        saving = true;
        let successCount = 0;
        let errorCount = 0;

        try {
            for (const [alunoId, presenca] of presencas) {
                const payload = {
                    id_aluno: alunoId,
                    id_turma: parseInt(selectedTurma),
                    status_presenca: presenca.status,
                    data_time_presenca: `${selectedData}T08:00:00`,
                };

                try {
                    if (presenca.presencaId) {
                        // Update existing
                        const response = await apiFetch(
                            `/presencas/atualizar/${presenca.presencaId}`,
                            {
                                method: "PUT",
                                body: JSON.stringify(payload),
                            },
                        );

                        if (response.success) successCount++;
                        else errorCount++;
                    } else {
                        // Create new
                        const response = await apiFetch(`/presencas/criar`, {
                            method: "POST",
                            body: JSON.stringify(payload),
                        });

                        if (response.success) successCount++;
                        else errorCount++;
                    }
                } catch (err) {
                    console.error("Erro ao salvar presença:", err);
                    errorCount++;
                }
            }

            if (errorCount === 0) {
                displayToast(
                    `Presenças salvas com sucesso! (${successCount} registros)`,
                    "success",
                );
            } else {
                displayToast(
                    `Algumas presenças não foram salvas. Sucesso: ${successCount}, Erros: ${errorCount}`,
                    "warning",
                );
            }

            // Reload presences to get updated IDs
            await loadAlunosDaTurma(selectedTurma);
        } catch (error) {
            console.error("Erro ao salvar presenças:", error);
            displayToast("Erro ao salvar presenças. Tente novamente.", "error");
        } finally {
            saving = false;
        }
    }

    onMount(async () => {
        // Set today's date as default
        const hoje = new Date();
        selectedData = hoje.toISOString().split("T")[0];

        await loadTurmas();
    });
</script>

<div class="presencas-manager">
    <div class="page-header">
        <h1>Controle de Presenças</h1>
        <p>Registre presença, falta ou atraso por turma</p>
    </div>

    <!-- Form Controls -->
    <div class="form-controls">
        <FormSelect
            id="turma"
            label="Turma *"
            bind:value={selectedTurma}
            on:change={handleTurmaChange}
        >
            <option value="">Selecione uma turma</option>
            {#each turmas as turma}
                <option value={turma.id_turma}>
                    {turma.nome_turma} - {turma.unidade_turma || "Sem unidade"}
                </option>
            {/each}
        </FormSelect>

        <div class="form-group">
            <label for="data">Data *</label>
            <input
                type="date"
                id="data"
                bind:value={selectedData}
                on:change={handleDataChange}
                required
            />
        </div>

        <button
            type="button"
            class="btn-save"
            on:click={salvarPresencas}
            disabled={saving || alunosAtuais.length === 0}
        >
            {saving ? "Salvando..." : "Salvar Presenças"}
        </button>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
        <div class="stat-card total">
            <h3>Total</h3>
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

    <!-- Table -->
    <div class="table-container">
        {#if loading}
            <div class="loading-state">
                <span class="loading-spinner"></span> Carregando...
            </div>
        {:else if !selectedTurma}
            <div class="empty-state">
                Selecione uma turma para visualizar os alunos
            </div>
        {:else if loadingAlunos}
            <div class="loading-state">
                <span class="loading-spinner"></span> Carregando alunos...
            </div>
        {:else if alunosAtuais.length === 0}
            <div class="empty-state">Nenhum aluno matriculado nesta turma.</div>
        {:else}
            <div class="table-content">
                <div class="table-header">
                    <div>Aluno</div>
                    <div>Status</div>
                    <div>Justificativa</div>
                </div>
                <div class="table-body">
                    {#each alunosAtuais as aluno (aluno.id_aluno)}
                        {@const presenca = presencas.get(aluno.id_aluno)}
                        <div class="table-row">
                            <div class="student-info">
                                <span class="student-name"
                                    >{aluno.nome_aluno || "-"}</span
                                >
                                <span class="student-id"
                                    >ID: {aluno.id_aluno}</span
                                >
                                {#if aluno.neurodivergente}
                                    <span class="neurodivergente-badge"
                                        >📚 Acomp. Especial</span
                                    >
                                {/if}
                            </div>
                            <div>
                                <select
                                    class="status-select {getStatusClass(
                                        presenca?.status || 'Presente',
                                    )}"
                                    value={presenca?.status || "Presente"}
                                    on:change={(e) =>
                                        handleStatusChange(
                                            aluno.id_aluno,
                                            e.currentTarget.value,
                                        )}
                                >
                                    <option value="Presente">✓ Presente</option>
                                    <option value="Atraso">⏰ Atraso</option>
                                    <option value="Falta">✗ Falta</option>
                                </select>
                            </div>
                            <div class="justificativa-cell">
                                {#if presenca?.status === "Falta"}
                                    {#if presenca?.justificativaId}
                                        <button
                                            type="button"
                                            class="btn-justificativa view"
                                            on:click={() => openJustificativaDialog(aluno, presenca)}
                                        >
                                            📄 Ver Justificativa
                                        </button>
                                    {:else}
                                        <button
                                            type="button"
                                            class="btn-justificativa add"
                                            on:click={() => openJustificativaDialog(aluno, presenca)}
                                        >
                                            ➕ Justificar
                                        </button>
                                    {/if}
                                {:else}
                                    <span class="no-justificativa">-</span>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
</div>

<!-- Toast Notification -->
<Toast bind:show={showToast} message={toastMessage} type={toastType} />

<!-- Justificativa Dialog -->
<JustificativaDialog
    bind:show={showJustificativaDialog}
    justificativaId={selectedJustificativaId}
    alunoId={selectedAlunoId}
    alunoNome={selectedAlunoNome}
    presencaId={selectedPresencaId}
    on:save={handleJustificativaSave}
/>

<style>
    .presencas-manager {
        width: 100%;
    }

    .page-header {
        margin-bottom: 2rem;
        padding-bottom: 1.5rem;
        border-bottom: 2px solid #e2e8f0;
    }

    .page-header h1 {
        font-size: 1.8rem;
        margin: 0 0 0.5rem 0;
        color: #2d3748;
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

    .form-group input {
        padding: 0.75rem;
        border: 1px solid #cbd5e0;
        border-radius: 6px;
        font-size: 1rem;
        color: #2d3748;
        background-color: #fdfdfd;
    }

    .form-group input:focus {
        outline: none;
        border-color: #3182ce;
        box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.2);
    }

    .btn-save {
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        border: none;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.3s;
        background-color: #e53e3e;
        color: white;
        white-space: nowrap;
        height: fit-content;
    }

    .btn-save:hover {
        background-color: #c53030;
    }

    .btn-save:disabled {
        background-color: #cbd5e0;
        cursor: not-allowed;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .stat-card {
        padding: 1.25rem;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        text-align: center;
    }

    .stat-card.total {
        background: linear-gradient(135deg, #4299e1 0%, #2b6cb0 100%);
        color: white;
    }

    .stat-card.present {
        background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
        color: white;
    }

    .stat-card.late {
        background: linear-gradient(135deg, #ed8936 0%, #c05621 100%);
        color: white;
    }

    .stat-card.absent {
        background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
        color: white;
    }

    .stat-card h3 {
        font-size: 0.85rem;
        margin: 0 0 0.5rem 0;
        font-weight: 500;
        opacity: 0.9;
    }

    .stat-card .value {
        font-size: 2rem;
        font-weight: 700;
        margin: 0;
    }

    .table-container {
        margin-top: 2rem;
    }

    .empty-state,
    .loading-state {
        text-align: center;
        padding: 3rem 1rem;
        color: #718096;
        font-size: 1rem;
    }

    .loading-spinner {
        display: inline-block;
        width: 24px;
        height: 24px;
        border: 3px solid #e2e8f0;
        border-top-color: #3182ce;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: 0.5rem;
        vertical-align: middle;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .table-content {
        border: 1px solid #cbd5e0;
        border-radius: 8px;
        overflow: hidden;
    }

    .table-header {
        display: grid;
        grid-template-columns: 2fr 1fr 2fr;
        gap: 1rem;
        padding: 1rem;
        background-color: #e2e8f0;
        font-weight: 600;
        color: #2d3748;
    }

    .table-body {
        background-color: white;
    }

    .table-row {
        display: grid;
        grid-template-columns: 2fr 1fr 2fr;
        gap: 1rem;
        padding: 1rem;
        border-bottom: 1px solid #cbd5e0;
        align-items: center;
    }

    .table-row:last-child {
        border-bottom: none;
    }

    .table-row:hover {
        background-color: #f7fafc;
    }

    .student-info {
        display: flex;
        flex-direction: column;
    }

    .student-name {
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 0.25rem;
    }

    .student-id {
        font-size: 0.85rem;
        color: #718096;
    }

    .neurodivergente-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.8rem;
        color: #6b46c1;
        margin-top: 0.25rem;
    }

    .status-select {
        width: 100%;
        padding: 0.6rem;
        border: 1px solid #cbd5e0;
        border-radius: 6px;
        font-size: 0.95rem;
        color: #2d3748;
        background-color: #fdfdfd;
        cursor: pointer;
    }

    .status-select:focus {
        outline: none;
        border-color: #3182ce;
        box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.2);
    }

    .status-select.presente {
        background-color: #c6f6d5;
        border-color: #48bb78;
    }

    .status-select.atraso {
        background-color: #feebc8;
        border-color: #ed8936;
    }

    .status-select.falta {
        background-color: #fed7d7;
        border-color: #e53e3e;
    }

    .justificativa-cell {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .btn-justificativa {
        padding: 0.5rem 1rem;
        border-radius: 6px;
        border: none;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s, transform 0.1s;
        white-space: nowrap;
    }

    .btn-justificativa:hover {
        transform: translateY(-1px);
    }

    .btn-justificativa:active {
        transform: translateY(0);
    }

    .btn-justificativa.add {
        background-color: #3182ce;
        color: white;
    }

    .btn-justificativa.add:hover {
        background-color: #2b6cb0;
    }

    .btn-justificativa.view {
        background-color: #48bb78;
        color: white;
    }

    .btn-justificativa.view:hover {
        background-color: #38a169;
    }

    .no-justificativa {
        color: #a0aec0;
        font-size: 1.25rem;
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
        }

        .table-header {
            display: none;
        }

        .table-row {
            grid-template-columns: 1fr;
            gap: 0.75rem;
            border: 1px solid #cbd5e0;
            border-radius: 8px;
            margin-bottom: 0.75rem;
        }
    }

    @media (max-width: 480px) {
        .page-header h1 {
            font-size: 1.25rem;
        }

        .stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
        }

        .stat-card {
            padding: 1rem;
        }

        .stat-card .value {
            font-size: 1.5rem;
        }
    }
</style>
