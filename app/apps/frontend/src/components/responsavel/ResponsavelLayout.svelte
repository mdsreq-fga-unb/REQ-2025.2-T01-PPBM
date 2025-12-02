<script lang="ts">
    import { onMount } from "svelte";
    import { authStore } from "../../stores/auth";
    import { responsavelNavigation } from "../../stores/responsavelNavigation";
    import ResponsavelHeader from "./ResponsavelHeader.svelte";
    import ResponsavelSidebar from "./ResponsavelSidebar.svelte";
    import PresencasFilho from "./sections/PresencasFilho.svelte";
    import Comunicacao from "./sections/Comunicacao.svelte";
    import RelatorioIndividual from "./sections/RelatorioIndividual.svelte";

    $: currentSection = $responsavelNavigation;

    onMount(async () => {
        // Check authentication
        const isAuth = await authStore.checkAuth();
        if (!isAuth) {
            console.log("User not authenticated, redirecting to login.");
            return;
        }

        // Check if user is responsavel type
        const user = $authStore.currentUser;
        if (user && user.tipo !== "responsavel") {
            // Redirect to appropriate portal based on user type
            if (user.tipo === "admin") {
                window.location.href = "/admin";
            } else if (user.tipo === "docente") {
                window.location.href = "/docente";
            }
        }
    });
</script>

<div
    class="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 text-slate-900"
>
    <ResponsavelHeader />

    <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6"
    >
        <ResponsavelSidebar />

        <!-- Main Content -->
        <main class="w-full h-full">
            {#if currentSection === "presencas"}
                <PresencasFilho />
            {:else if currentSection === "comunicacao"}
                <Comunicacao />
            {:else if currentSection === "relatorio"}
                <RelatorioIndividual />
            {/if}
        </main>
    </div>
</div>
