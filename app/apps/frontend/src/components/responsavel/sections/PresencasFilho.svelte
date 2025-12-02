<script lang="ts">
    import { onMount } from "svelte";
    import { authStore } from "../../../stores/auth";

    // State
    let periodo = "30";
    let showCustomDates = false;
    let dataInicio = "";
    let dataFim = "";
    let isLoading = false;

    // Statistics
    let totalDias = 0;
    let presencas = 0;
    let atrasos = 0;
    let faltas = 0;
    let taxaFrequencia = 0;

    // Child info
    let childName = "";
    let childTurma = "";

    // Attendance records
    let registros: {
        id: string;
        data: string;
        status: "presente" | "atraso" | "falta";
        observacoes?: string;
    }[] = [];

    $: currentUser = $authStore.currentUser;

    // Status styling
    const statusColors: Record<string, string> = {
        presente: "bg-green-100 text-green-700",
        atraso: "bg-yellow-100 text-yellow-700",
        falta: "bg-red-100 text-red-700",
    };

    const statusIcons: Record<string, string> = {
        presente: "✅",
        atraso: "⏰",
        falta: "❌",
    };

    function handlePeriodoChange() {
        showCustomDates = periodo === "custom";
        if (!showCustomDates) {
            loadAttendanceData();
        }
    }

    function handleCustomDateChange() {
        if (dataInicio && dataFim) {
            loadAttendanceData();
        }
    }

    async function loadAttendanceData() {
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

        // TODO: Replace with actual API call
        // For now, using mock data
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock data for demonstration
        childName = "Ana Pereira Silva";
        childTurma = "Turma A - Manhã";

        // Generate mock attendance records
        registros = generateMockRecords(startDate, endDate);

        // Calculate statistics
        totalDias = registros.length;
        presencas = registros.filter((r) => r.status === "presente").length;
        atrasos = registros.filter((r) => r.status === "atraso").length;
        faltas = registros.filter((r) => r.status === "falta").length;
        taxaFrequencia =
            totalDias > 0 ? Math.round((presencas / totalDias) * 100) : 0;

        isLoading = false;
    }

    function generateMockRecords(startDate: string, endDate: string) {
        const records: typeof registros = [];
        const start = new Date(startDate);
        const end = new Date(endDate);

        for (let d = new Date(end); d >= start; d.setDate(d.getDate() - 1)) {
            // Skip weekends
            if (d.getDay() === 0 || d.getDay() === 6) continue;

            const rand = Math.random();
            let status: "presente" | "atraso" | "falta";
            let observacoes = "";

            if (rand > 0.15) {
                status = "presente";
            } else if (rand > 0.05) {
                status = "atraso";
                observacoes = "Chegou alguns minutos atrasado";
            } else {
                status = "falta";
            }

            records.push({
                id: `att-${d.getTime()}`,
                data: d.toISOString().slice(0, 10),
                status,
                observacoes,
            });
        }

        return records;
    }

    function formatDate(dateStr: string): string {
        const date = new Date(dateStr + "T00:00:00");
        return date.toLocaleDateString("pt-BR");
    }

    onMount(() => {
        loadAttendanceData();
    });
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
            <span class="text-2xl font-bold text-[#E11D48]"
                >{taxaFrequencia}%</span
            >
        </div>
        <div class="w-full bg-slate-200 rounded-full h-3">
            <div
                class="bg-gradient-to-r from-[#E11D48] to-[#BE123C] h-3 rounded-full transition-all duration-500"
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
                        <td colspan="3" class="p-4 text-center text-slate-500"
                            >Carregando...</td
                        >
                    </tr>
                {:else if registros.length === 0}
                    <tr>
                        <td colspan="3" class="p-4 text-center text-slate-500">
                            Nenhum registro encontrado no período selecionado
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
                                    ]}"
                                >
                                    {statusIcons[registro.status]}
                                    {registro.status}
                                </span>
                            </td>
                            <td class="p-4">{registro.observacoes || "-"}</td>
                        </tr>
                    {/each}
                {/if}
            </tbody>
        </table>
    </div>
</section>
