<script lang="ts">
    import { authStore } from "../../../stores/auth";
    import { apiFetch } from "../../../lib/api";
    import Toast from "../../ui/Toast.svelte";

    // Toast state
    let toastMessage = "";
    let toastType: "success" | "error" | "warning" | "info" = "info";
    let showToast = false;

    function displayToast(message: string, type: typeof toastType = "info") {
        toastMessage = message;
        toastType = type;
        showToast = true;
    }

    // State
    let periodo = "30";
    let showCustomDates = false;
    let dataInicio = "";
    let dataFim = "";
    let isLoading = false;
    let isLoadingChildren = true;

    // Statistics
    let totalDias = 0;
    let presencas = 0;
    let atrasos = 0;
    let faltas = 0;
    let taxaFrequencia = 0;

    // Child info
    let childName = "";
    let childTurma = "";
    let selectedChildId: number | null = null;

    // Children list (for responsáveis with multiple children)
    let children: Array<{
        id_aluno: number;
        nome_aluno: string;
        turma: { nome_turma: string } | null;
    }> = [];

    // Attendance records
    let registros: {
        id: string;
        data: string;
        status: "presente" | "atraso" | "falta";
        observacoes?: string;
        justificativa?: {
            id: number;
            motivo: string;
            aprovada: boolean | null;
        } | null;
    }[] = [];

    $: currentUser = $authStore.currentUser;

    // Track if we've already initiated loading
    let hasInitiatedLoad = false;

    // Watch for currentUser changes and load when available
    $: if (currentUser?.email && !hasInitiatedLoad) {
        hasInitiatedLoad = true;
        loadChildren();
    }

    // Status styling
    const statusColors: Record<string, string> = {
        presente: "bg-green-100 text-green-700",
        atraso: "bg-yellow-100 text-yellow-700",
        falta: "bg-red-100 text-red-700",
        ausente: "bg-red-100 text-red-700",
    };

    const statusIcons: Record<string, string> = {
        presente: "✅",
        atraso: "⏰",
        falta: "❌",
        ausente: "❌",
    };

    // Dynamic color based on frequency rate
    function getFrequencyColor(rate: number): string {
        if (rate >= 75) return "text-green-600";
        if (rate >= 50) return "text-yellow-600";
        return "text-red-600";
    }

    function getFrequencyGradient(rate: number): string {
        if (rate >= 75) return "bg-gradient-to-r from-green-500 to-green-600";
        if (rate >= 50) return "bg-gradient-to-r from-yellow-500 to-yellow-600";
        return "bg-gradient-to-r from-red-500 to-red-600";
    }

    function handlePeriodoChange() {
        showCustomDates = periodo === "custom";
        if (!showCustomDates && selectedChildId) {
            loadAttendanceData();
        }
    }

    function handleCustomDateChange() {
        if (dataInicio && dataFim && selectedChildId) {
            loadAttendanceData();
        }
    }

    function handleChildChange() {
        if (selectedChildId) {
            const child = children.find((c) => c.id_aluno === selectedChildId);
            if (child) {
                childName = child.nome_aluno;
                childTurma = child.turma?.nome_turma || "Sem turma";
            }
            loadAttendanceData();
        }
    }

    async function loadChildren() {
        if (!currentUser?.email) {
            isLoadingChildren = false;
            return;
        }

        isLoadingChildren = true;

        try {
            // First get the responsável ID by email
            const respResponse = await apiFetch<{
                success: boolean;
                data: { id_responsavel: number; nome_responsavel: string };
            }>(
                `/responsaveis/por-email/${encodeURIComponent(currentUser.email)}`,
            );

            if (!respResponse.success || !respResponse.data) {
                displayToast("Responsável não encontrado no sistema", "error");
                isLoadingChildren = false;
                return;
            }

            const responsavelId = (respResponse.data as any).data
                .id_responsavel;

            // Now get the children for this responsável
            const childrenResponse = await apiFetch<{
                success: boolean;
                data: Array<{
                    id_aluno: number;
                    nome_aluno: string;
                    turma: { nome_turma: string } | null;
                }>;
            }>(`/responsaveis/meus-filhos/${responsavelId}`);

            if (childrenResponse.success && childrenResponse.data) {
                const responseData = childrenResponse.data as any;
                children = responseData.data || [];

                if (children.length > 0) {
                    // Auto-select first child
                    selectedChildId = children[0].id_aluno;
                    childName = children[0].nome_aluno;
                    childTurma = children[0].turma?.nome_turma || "Sem turma";
                    await loadAttendanceData();
                } else {
                    displayToast(
                        "Nenhum filho vinculado à sua conta",
                        "warning",
                    );
                }
            }
        } catch (error) {
            console.error("Error loading children:", error);
            displayToast("Erro ao carregar dados dos filhos", "error");
        } finally {
            isLoadingChildren = false;
        }
    }

    async function loadAttendanceData() {
        if (!selectedChildId) return;

        isLoading = true;

        // Calculate date range
        let startDate: string;
        let endDate: string;

        if (periodo === "custom") {
            startDate = dataInicio;
            endDate = dataFim;
        } else {
            const hoje = new Date();
            endDate = hoje.toISOString().slice(0, 10);
            const inicio = new Date(hoje);
            inicio.setDate(inicio.getDate() - parseInt(periodo));
            startDate = inicio.toISOString().slice(0, 10);
        }

        try {
            // Build query params
            const params = new URLSearchParams();
            if (startDate) params.append("from", startDate);
            if (endDate) params.append("to", endDate);

            const response = await apiFetch<{
                success: boolean;
                aluno: { id_aluno: number; nome_aluno: string; turma: string };
                estatisticas: {
                    totalDias: number;
                    presentes: number;
                    atrasos: number;
                    faltas: number;
                    taxaFrequencia: number;
                };
                registros: Array<{
                    id: string;
                    data: string;
                    status: string;
                    justificativa: {
                        id: number;
                        motivo: string;
                        aprovada: boolean | null;
                    } | null;
                }>;
            }>(
                `/responsaveis/presencas-filho/${selectedChildId}?${params.toString()}`,
            );

            if (response.success && response.data) {
                const data = response.data as any;

                // Update child info
                if (data.aluno) {
                    childName = data.aluno.nome_aluno;
                    childTurma = data.aluno.turma || "Sem turma";
                }

                // Update statistics
                if (data.estatisticas) {
                    totalDias = data.estatisticas.totalDias;
                    presencas = data.estatisticas.presentes;
                    atrasos = data.estatisticas.atrasos;
                    faltas = data.estatisticas.faltas;
                    taxaFrequencia = data.estatisticas.taxaFrequencia;
                }

                // Update records
                registros = (data.registros || []).map((r: any) => ({
                    id: r.id,
                    data: r.data,
                    status: r.status,
                    observacoes: r.justificativa?.motivo || "",
                    justificativa: r.justificativa,
                }));
            } else {
                displayToast("Erro ao carregar dados de presença", "error");
            }
        } catch (error) {
            console.error("Error loading attendance:", error);
            displayToast("Erro ao carregar dados de presença", "error");
        } finally {
            isLoading = false;
        }
    }

    function formatDate(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleDateString("pt-BR");
    }

    // onMount is no longer needed - reactive statement handles loading when currentUser is available
</script>

<section
    class="bg-white rounded-3xl p-6 border border-slate-200"
    style="box-shadow: 0 10px 30px rgba(0,0,0,.08), 0 6px 10px rgba(0,0,0,.06);"
>
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <div class="flex-1">
            <h2 class="text-2xl font-bold text-slate-900 mb-1">
                Presenças do Meu Filho
            </h2>
            <p class="text-slate-500">
                {#if childName}
                    {childName} - {childTurma}
                {:else}
                    Acompanhe a frequência escolar
                {/if}
            </p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
            {#if children.length > 1}
                <div>
                    <label
                        for="childSelect"
                        class="block text-sm font-medium mb-1">Filho(a)</label
                    >
                    <select
                        id="childSelect"
                        bind:value={selectedChildId}
                        on:change={handleChildChange}
                        class="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
                    >
                        {#each children as child}
                            <option value={child.id_aluno}
                                >{child.nome_aluno}</option
                            >
                        {/each}
                    </select>
                </div>
            {/if}
            <div>
                <label for="periodo" class="block text-sm font-medium mb-1"
                    >Período</label
                >
                <select
                    id="periodo"
                    bind:value={periodo}
                    on:change={handlePeriodoChange}
                    class="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
                >
                    <option value="7">Últimos 7 dias</option>
                    <option value="15">Últimos 15 dias</option>
                    <option value="30">Últimos 30 dias</option>
                    <option value="custom">Período personalizado</option>
                </select>
            </div>
            {#if showCustomDates}
                <div class="flex gap-2">
                    <input
                        type="date"
                        bind:value={dataInicio}
                        on:change={handleCustomDateChange}
                        class="px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
                    />
                    <input
                        type="date"
                        bind:value={dataFim}
                        on:change={handleCustomDateChange}
                        class="px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
                    />
                </div>
            {/if}
        </div>
    </div>

    {#if isLoadingChildren}
        <div class="text-center py-12 text-slate-500">
            <p>Carregando dados...</p>
        </div>
    {:else if children.length === 0}
        <div class="text-center py-12 text-slate-500">
            <p>Nenhum filho vinculado à sua conta.</p>
            <p class="text-sm mt-2">
                Entre em contato com a administração para vincular seus filhos.
            </p>
        </div>
    {:else}
        <!-- Stats Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div
                class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white text-center"
            >
                <div class="text-2xl font-bold">{totalDias}</div>
                <div class="text-sm opacity-90">Total de Dias</div>
            </div>
            <div
                class="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white text-center"
            >
                <div class="text-2xl font-bold">{presencas}</div>
                <div class="text-sm opacity-90">Presenças</div>
            </div>
            <div
                class="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-4 text-white text-center"
            >
                <div class="text-2xl font-bold">{atrasos}</div>
                <div class="text-sm opacity-90">Atrasos</div>
            </div>
            <div
                class="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white text-center"
            >
                <div class="text-2xl font-bold">{faltas}</div>
                <div class="text-sm opacity-90">Faltas</div>
            </div>
        </div>

        <!-- Frequency Bar -->
        <div class="bg-slate-50 rounded-xl p-4 mb-6">
            <div class="flex items-center justify-between mb-2">
                <span class="font-medium">Taxa de Frequência</span>
                <span
                    class="text-2xl font-bold {getFrequencyColor(
                        taxaFrequencia,
                    )}">{taxaFrequencia}%</span
                >
            </div>
            <div class="w-full bg-slate-200 rounded-full h-3">
                <div
                    class="{getFrequencyGradient(
                        taxaFrequencia,
                    )} h-3 rounded-full transition-all duration-500"
                    style="width: {taxaFrequencia}%"
                ></div>
            </div>
        </div>

        <!-- Attendance Table -->
        <div class="overflow-x-auto">
            <table
                class="w-full border border-slate-200 rounded-xl overflow-hidden"
            >
                <thead class="bg-slate-50">
                    <tr class="text-left text-sm">
                        <th class="p-4">Data</th>
                        <th class="p-4">Status</th>
                        <th class="p-4">Observações</th>
                    </tr>
                </thead>
                <tbody class="text-sm">
                    {#if isLoading}
                        <tr>
                            <td
                                colspan="3"
                                class="p-4 text-center text-slate-500"
                                >Carregando...</td
                            >
                        </tr>
                    {:else if registros.length === 0}
                        <tr>
                            <td
                                colspan="3"
                                class="p-4 text-center text-slate-500"
                            >
                                Nenhum registro encontrado no período
                                selecionado
                            </td>
                        </tr>
                    {:else}
                        {#each registros as registro}
                            <tr class="border-t">
                                <td class="p-4">{formatDate(registro.data)}</td>
                                <td class="p-4">
                                    <span
                                        class="px-2 py-1 rounded-full text-xs {statusColors[
                                            registro.status
                                        ] || statusColors['falta']}"
                                    >
                                        {statusIcons[registro.status] || "❌"}
                                        {registro.status}
                                    </span>
                                    {#if registro.justificativa}
                                        <span
                                            class="ml-2 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700"
                                        >
                                            {registro.justificativa.aprovada ===
                                            true
                                                ? "Justificada ✓"
                                                : registro.justificativa
                                                        .aprovada === false
                                                  ? "Justificativa rejeitada"
                                                  : "Aguardando aprovação"}
                                        </span>
                                    {/if}
                                </td>
                                <td class="p-4"
                                    >{registro.observacoes || "-"}</td
                                >
                            </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>
        </div>
    {/if}
</section>

<!-- Toast notifications -->
<Toast bind:show={showToast} message={toastMessage} type={toastType} />
