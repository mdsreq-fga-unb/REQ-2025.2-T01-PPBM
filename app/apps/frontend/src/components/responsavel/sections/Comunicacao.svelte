<script lang="ts">
    import { authStore } from "../../../stores/auth";
    import { apiFetch } from "../../../lib/api";
    import Toast from "../../ui/Toast.svelte";

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

    // State
    let activeTab: "mensagens" | "avisos" = "mensagens";
    let isLoading = false;
    let responsavelId: number | null = null;

    // Messages
    let mensagens: {
        id: string;
        tipo: "recebida" | "enviada";
        remetente: string;
        assunto: string;
        conteudo: string;
        timestamp: string;
        urgente: boolean;
    }[] = [];

    // Notices
    let avisos: {
        id: string;
        tipo: "informativo" | "importante" | "urgente" | "evento";
        titulo: string;
        conteudo: string;
        timestamp: string;
        ativo: boolean;
    }[] = [];

    $: currentUser = $authStore.currentUser;

    // Track if we've already initiated loading
    let hasInitiatedLoad = false;

    // Watch for currentUser changes and load when available
    $: if (currentUser?.email && !hasInitiatedLoad) {
        hasInitiatedLoad = true;
        loadResponsavelData();
    }

    const tipoColors: Record<string, string> = {
        informativo: "bg-blue-100 text-blue-700",
        importante: "bg-yellow-100 text-yellow-700",
        urgente: "bg-red-100 text-red-700",
        evento: "bg-green-100 text-green-700",
    };

    function setTab(tab: typeof activeTab) {
        activeTab = tab;
    }

    async function loadResponsavelData() {
        if (!currentUser?.email) return;

        try {
            // Get responsável ID by email
            const respResponse = await apiFetch<{
                success: boolean;
                data: { id_responsavel: number };
            }>(
                `/responsaveis/por-email/${encodeURIComponent(currentUser.email)}`,
            );

            if (respResponse.success && respResponse.data) {
                responsavelId = (respResponse.data as any).data.id_responsavel;

                // Load messages and notices
                await Promise.all([loadMessages(), loadNotices()]);
            }
        } catch (error) {
            console.error("Error loading responsável data:", error);
            displayToast("Erro ao carregar dados", "error");
        }
    }

    async function loadMessages() {
        if (!responsavelId) return;

        isLoading = true;

        try {
            const response = await apiFetch<{
                success: boolean;
                data: Array<{
                    id: string;
                    tipo: "recebida" | "enviada";
                    remetente: string;
                    assunto: string;
                    conteudo: string;
                    timestamp: string;
                    urgente: boolean;
                }>;
            }>(`/responsaveis/mensagens/${responsavelId}`);

            if (response.success && response.data) {
                mensagens = (response.data as any)?.data || [];
            }
        } catch (error) {
            console.error("Error loading messages:", error);
            displayToast("Erro ao carregar mensagens", "error");
        } finally {
            isLoading = false;
        }
    }

    async function loadNotices() {
        isLoading = true;

        try {
            const response = await apiFetch<{
                success: boolean;
                data: Array<{
                    id: string;
                    tipo: "informativo" | "importante" | "urgente" | "evento";
                    titulo: string;
                    conteudo: string;
                    timestamp: string;
                    ativo: boolean;
                }>;
            }>("/responsaveis/avisos");

            if (response.success && response.data) {
                avisos = (response.data as any)?.data || [];
            }
        } catch (error) {
            console.error("Error loading notices:", error);
            displayToast("Erro ao carregar avisos", "error");
        } finally {
            isLoading = false;
        }
    }

    function formatDateTime(timestamp: string): { date: string; time: string } {
        const date = new Date(timestamp);
        return {
            date: date.toLocaleDateString("pt-BR"),
            time: date.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };
    }

    // onMount is no longer needed - reactive statement handles loading when currentUser is available
</script>

<section
    class="bg-white rounded-3xl p-6 border border-slate-200"
    style="box-shadow: 0 10px 30px rgba(0,0,0,.08), 0 6px 10px rgba(0,0,0,.06);"
>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
        <div>
            <h2 class="text-2xl font-bold text-slate-900 mb-1">Comunicação</h2>
            <p class="text-slate-500">Mensagens e avisos da escola</p>
        </div>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-slate-200 mb-6">
        <button
            on:click={() => setTab("mensagens")}
            class="px-4 py-2 border-b-2 font-medium transition {activeTab ===
            'mensagens'
                ? 'border-[#E11D48] text-[#E11D48]'
                : 'border-transparent text-slate-500 hover:text-slate-700'}"
        >
            Mensagens Recebidas
        </button>
        <button
            on:click={() => setTab("avisos")}
            class="px-4 py-2 border-b-2 font-medium transition {activeTab ===
            'avisos'
                ? 'border-[#E11D48] text-[#E11D48]'
                : 'border-transparent text-slate-500 hover:text-slate-700'}"
        >
            Avisos Gerais
        </button>
    </div>

    <!-- Tab Content: Mensagens -->
    {#if activeTab === "mensagens"}
        <div class="space-y-4">
            {#if isLoading}
                <div class="text-center text-slate-500 py-8">
                    Carregando mensagens...
                </div>
            {:else if mensagens.length === 0}
                <div class="text-center text-slate-500 py-8">
                    Nenhuma mensagem recebida
                </div>
            {:else}
                {#each mensagens as msg}
                    {@const { date, time } = formatDateTime(msg.timestamp)}
                    <div class="p-4 border border-slate-200 rounded-lg">
                        <div class="flex items-center justify-between mb-2">
                            <div class="font-medium">{msg.assunto}</div>
                            <div class="flex gap-2">
                                {#if msg.urgente}
                                    <span
                                        class="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs"
                                    >
                                        Urgente
                                    </span>
                                {/if}
                                <span
                                    class="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs"
                                >
                                    {msg.remetente}
                                </span>
                            </div>
                        </div>
                        <div class="text-sm text-slate-600 mb-3">
                            {msg.conteudo}
                        </div>
                        <div class="text-xs text-slate-500">
                            Recebido em {date} às {time}
                        </div>
                    </div>
                {/each}
            {/if}
        </div>
    {/if}

    <!-- Tab Content: Avisos -->
    {#if activeTab === "avisos"}
        <div class="space-y-4">
            {#if isLoading}
                <div class="text-center text-slate-500 py-8">
                    Carregando avisos...
                </div>
            {:else if avisos.length === 0}
                <div class="text-center text-slate-500 py-8">
                    Nenhum aviso disponível
                </div>
            {:else}
                {#each avisos as aviso}
                    {@const { date } = formatDateTime(aviso.timestamp)}
                    <div class="p-4 border border-slate-200 rounded-lg">
                        <div class="flex items-center justify-between mb-2">
                            <div class="font-medium">{aviso.titulo}</div>
                            <span
                                class="px-2 py-1 rounded-full text-xs {tipoColors[
                                    aviso.tipo
                                ] || tipoColors['informativo']}"
                            >
                                {aviso.tipo}
                            </span>
                        </div>
                        <div class="text-sm text-slate-600 mb-2">
                            {aviso.conteudo}
                        </div>
                        <div class="text-xs text-slate-500">
                            Publicado em {date}
                        </div>
                    </div>
                {/each}
            {/if}
        </div>
    {/if}
</section>

<!-- Toast notifications -->
<Toast bind:show={showToast} message={toastMessage} type={toastType} />
