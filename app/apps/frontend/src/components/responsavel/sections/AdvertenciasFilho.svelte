<script lang="ts">
    import { authStore } from "../../../stores/auth";
    import { apiFetch } from "../../../lib/api";
    import Toast from "../../ui/Toast.svelte";

    // Interfaces
    interface Advertencia {
        id_advertencia: number;
        created_at: string;
        id_aluno: number;
        id_docente: number | null;
        descricao_advertencia: string;
        docentes: { id_docente: number; nome_docente: string } | null;
    }

    interface Child {
        id_aluno: number;
        nome_aluno: string;
        turma: { nome_turma: string } | null;
    }

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
    let isLoadingChildren = true;
    let isLoadingAdvertencias = false;
    let children: Child[] = [];
    let selectedChildId: number | null = null;
    let childName = "";
    let childTurma = "";
    let advertencias: Advertencia[] = [];

    $: currentUser = $authStore.currentUser;

    // Track if we've already initiated loading
    let hasInitiatedLoad = false;

    // Watch for currentUser changes and load when available
    $: if (currentUser?.email && !hasInitiatedLoad) {
        hasInitiatedLoad = true;
        loadChildren();
    }

    function handleChildChange() {
        if (selectedChildId) {
            const child = children.find((c) => c.id_aluno === selectedChildId);
            if (child) {
                childName = child.nome_aluno;
                childTurma = child.turma?.nome_turma || "Sem turma";
            }
            loadAdvertencias();
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
                data: Child[];
            }>(`/responsaveis/meus-filhos/${responsavelId}`);

            if (childrenResponse.success && childrenResponse.data) {
                const responseData = childrenResponse.data as any;
                children = responseData.data || [];

                if (children.length > 0) {
                    // Auto-select first child
                    selectedChildId = children[0].id_aluno;
                    childName = children[0].nome_aluno;
                    childTurma = children[0].turma?.nome_turma || "Sem turma";
                    await loadAdvertencias();
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

    async function loadAdvertencias() {
        if (!selectedChildId) return;

        isLoadingAdvertencias = true;

        try {
            const response = await apiFetch<{
                success: boolean;
                data: Advertencia[];
                total: number;
            }>(`/advertencias/por-aluno/${selectedChildId}`);

            if (response.success && response.data) {
                const responseData = response.data as any;
                advertencias = responseData.data || [];
            } else {
                displayToast("Erro ao carregar advertências", "error");
                advertencias = [];
            }
        } catch (error) {
            console.error("Error loading advertencias:", error);
            displayToast("Erro ao carregar advertências", "error");
            advertencias = [];
        } finally {
            isLoadingAdvertencias = false;
        }
    }

    function formatDate(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    }

    function formatTime(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    }
</script>

<section
    class="bg-white rounded-3xl p-6 border border-slate-200"
    style="box-shadow: 0 10px 30px rgba(0,0,0,.08), 0 6px 10px rgba(0,0,0,.06);"
>
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <div class="flex-1">
            <h2 class="text-2xl font-bold text-slate-900 mb-1">
                Advertências do Meu Filho
            </h2>
            <p class="text-slate-500">
                {#if childName}
                    {childName} - {childTurma}
                {:else}
                    Acompanhe as advertências registradas
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
                        class="w-full px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    >
                        {#each children as child}
                            <option value={child.id_aluno}
                                >{child.nome_aluno}</option
                            >
                        {/each}
                    </select>
                </div>
            {/if}
        </div>
    </div>

    <!-- Loading State for Children -->
    {#if isLoadingChildren}
        <div class="flex items-center justify-center py-16">
            <div class="flex flex-col items-center gap-3">
                <div
                    class="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"
                ></div>
                <p class="text-slate-500">Carregando dados...</p>
            </div>
        </div>
    {:else if children.length === 0}
        <!-- No Children State -->
        <div
            class="flex flex-col items-center justify-center py-16 text-center"
        >
            <div
                class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4"
            >
                <span class="text-4xl">👤</span>
            </div>
            <h3 class="text-lg font-semibold text-slate-700 mb-2">
                Nenhum filho vinculado
            </h3>
            <p class="text-slate-500 max-w-md">
                Não encontramos nenhum aluno vinculado à sua conta. Entre em
                contato com a administração.
            </p>
        </div>
    {:else}
        <!-- Statistics Card -->
        <div class="mb-6">
            <div
                class="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white"
            >
                <div class="flex items-center gap-4">
                    <div
                        class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center"
                    >
                        <span class="text-3xl">⚠️</span>
                    </div>
                    <div>
                        <p class="text-white/80 text-sm">Total de Advertências</p>
                        <p class="text-4xl font-bold">
                            {#if isLoadingAdvertencias}
                                <span class="text-2xl">...</span>
                            {:else}
                                {advertencias.length}
                            {/if}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Loading State for Advertências -->
        {#if isLoadingAdvertencias}
            <div class="flex items-center justify-center py-12">
                <div class="flex flex-col items-center gap-3">
                    <div
                        class="w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"
                    ></div>
                    <p class="text-slate-500">Carregando advertências...</p>
                </div>
            </div>
        {:else if advertencias.length === 0}
            <!-- Empty State -->
            <div
                class="flex flex-col items-center justify-center py-12 text-center"
            >
                <div
                    class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4"
                >
                    <span class="text-4xl">✅</span>
                </div>
                <h3 class="text-lg font-semibold text-slate-700 mb-2">
                    Nenhuma advertência
                </h3>
                <p class="text-slate-500 max-w-md">
                    {childName} não possui nenhuma advertência registrada. Continue assim!
                </p>
            </div>
        {:else}
            <!-- Advertências Timeline -->
            <div class="space-y-4">
                <h3 class="text-lg font-semibold text-slate-700 mb-4">
                    Histórico de Advertências
                </h3>
                {#each advertencias as advertencia (advertencia.id_advertencia)}
                    <div
                        class="bg-amber-50 border border-amber-200 rounded-2xl p-5 transition-all hover:shadow-md"
                    >
                        <div class="flex items-start gap-4">
                            <div
                                class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0"
                            >
                                <span class="text-2xl">⚠️</span>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div
                                    class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2"
                                >
                                    <div class="flex items-center gap-2">
                                        <span
                                            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-200 text-amber-800"
                                        >
                                            Advertência #{advertencia.id_advertencia}
                                        </span>
                                    </div>
                                    <div class="text-sm text-slate-500">
                                        <span class="font-medium"
                                            >{formatDate(
                                                advertencia.created_at,
                                            )}</span
                                        >
                                        <span class="mx-1">às</span>
                                        <span
                                            >{formatTime(
                                                advertencia.created_at,
                                            )}</span
                                        >
                                    </div>
                                </div>
                                <p class="text-slate-700 mb-3">
                                    {advertencia.descricao_advertencia}
                                </p>
                                {#if advertencia.docentes}
                                    <div
                                        class="flex items-center gap-2 text-sm text-slate-500"
                                    >
                                        <span>👤</span>
                                        <span
                                            >Registrado por: <span
                                                class="font-medium text-slate-700"
                                                >{advertencia.docentes
                                                    .nome_docente}</span
                                            ></span
                                        >
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    {/if}
</section>

<Toast bind:show={showToast} message={toastMessage} type={toastType} />
