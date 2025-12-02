<script lang="ts">
    import { onMount } from "svelte";
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
    let activeTab: "mensagens" | "avisos" | "enviar" = "mensagens";
    let isLoading = false;
    let responsavelId: number | null = null;
    let selectedChildId: number | null = null;

    // Children (for context in messages)
    let children: Array<{
        id_aluno: number;
        nome_aluno: string;
    }> = [];

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

    // Send message form
    let destinatario = "coordenacao";
    let assunto = "";
    let conteudo = "";
    let isSending = false;

    $: currentUser = $authStore.currentUser;

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
                responsavelId = (respResponse.data as any).id_responsavel;

                // Get children for this responsável
                const childrenResponse = await apiFetch<{
                    success: boolean;
                    data: Array<{ id_aluno: number; nome_aluno: string }>;
                }>(`/responsaveis/meus-filhos/${responsavelId}`);

                if (childrenResponse.success && childrenResponse.data) {
                    const responseData = childrenResponse.data as any;
                    children = responseData.data || [];
                    if (children.length > 0) {
                        selectedChildId = children[0].id_aluno;
                    }
                }

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
                mensagens = (response.data as any) || [];
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
                avisos = (response.data as any) || [];
            }
        } catch (error) {
            console.error("Error loading notices:", error);
            displayToast("Erro ao carregar avisos", "error");
        } finally {
            isLoading = false;
        }
    }

    async function handleSendMessage() {
        if (!assunto.trim() || !conteudo.trim()) {
            displayToast("Preencha o assunto e a mensagem", "warning");
            return;
        }

        if (!responsavelId) {
            displayToast("Erro: responsável não identificado", "error");
            return;
        }

        isSending = true;

        try {
            const response = await apiFetch<{ success: boolean }>(
                "/responsaveis/enviar-mensagem",
                {
                    method: "POST",
                    body: JSON.stringify({
                        id_responsavel: responsavelId,
                        id_aluno: selectedChildId,
                        destinatario,
                        assunto,
                        conteudo,
                    }),
                },
            );

            if (response.success) {
                // Clear form
                assunto = "";
                conteudo = "";
                destinatario = "coordenacao";

                displayToast("Mensagem enviada com sucesso!", "success");

                // Switch to messages tab and reload
                activeTab = "mensagens";
                await loadMessages();
            } else {
                displayToast("Erro ao enviar mensagem", "error");
            }
        } catch (error) {
            console.error("Error sending message:", error);
            displayToast("Erro ao enviar mensagem", "error");
        } finally {
            isSending = false;
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

    function goToSendTab() {
        activeTab = "enviar";
    }

    onMount(() => {
        loadResponsavelData();
    });
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
        <button
            on:click={goToSendTab}
            class="px-4 py-2 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white transition"
        >
            Enviar Mensagem
        </button>
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
        <button
            on:click={() => setTab("enviar")}
            class="px-4 py-2 border-b-2 font-medium transition {activeTab ===
            'enviar'
                ? 'border-[#E11D48] text-[#E11D48]'
                : 'border-transparent text-slate-500 hover:text-slate-700'}"
        >
            Enviar Mensagem
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

    <!-- Tab Content: Enviar -->
    {#if activeTab === "enviar"}
        <div class="max-w-2xl">
            <form
                on:submit|preventDefault={handleSendMessage}
                class="space-y-4"
            >
                <div>
                    <label
                        for="destinatario"
                        class="block text-sm font-medium mb-1">Para</label
                    >
                    <select
                        id="destinatario"
                        bind:value={destinatario}
                        class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
                    >
                        <option value="coordenacao">Coordenação</option>
                        <option value="professor">Professor da Turma</option>
                        <option value="administracao">Administração</option>
                    </select>
                </div>

                {#if children.length > 1}
                    <div>
                        <label
                            for="childSelect"
                            class="block text-sm font-medium mb-1"
                            >Referente a</label
                        >
                        <select
                            id="childSelect"
                            bind:value={selectedChildId}
                            class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
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
                    <label for="assunto" class="block text-sm font-medium mb-1"
                        >Assunto</label
                    >
                    <input
                        id="assunto"
                        type="text"
                        bind:value={assunto}
                        placeholder="Ex: Dúvida sobre atividade, Justificativa de falta..."
                        class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
                    />
                </div>

                <div>
                    <label for="conteudo" class="block text-sm font-medium mb-1"
                        >Mensagem</label
                    >
                    <textarea
                        id="conteudo"
                        bind:value={conteudo}
                        rows="6"
                        placeholder="Digite sua mensagem aqui..."
                        class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
                    ></textarea>
                </div>

                <button
                    type="submit"
                    disabled={isSending}
                    class="w-full py-3 px-4 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSending ? "Enviando..." : "Enviar Mensagem"}
                </button>
            </form>
        </div>
    {/if}
</section>

<!-- Toast notifications -->
<Toast bind:show={showToast} message={toastMessage} type={toastType} />
