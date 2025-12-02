<script lang="ts">
    import {
        responsavelNavigation,
        type ResponsavelSection,
    } from "../../stores/responsavelNavigation";

    const navItems: {
        icon: string;
        label: string;
        section: ResponsavelSection;
    }[] = [
        { icon: "📅", label: "Presenças do Meu Filho", section: "presencas" },
        { icon: "💬", label: "Comunicação", section: "comunicacao" },
        { icon: "📊", label: "Relatório Individual", section: "relatorio" },
    ];

    $: currentSection = $responsavelNavigation;

    function handleNavClick(section: ResponsavelSection) {
        responsavelNavigation.setSection(section);
    }
</script>

<aside class="lg:sticky lg:top-20 self-start">
    <nav
        class="bg-white rounded-2xl p-3 border border-slate-200"
        style="box-shadow: 0 10px 30px rgba(0,0,0,.08), 0 6px 10px rgba(0,0,0,.06);"
    >
        <ul class="space-y-2">
            {#each navItems as item}
                <li>
                    <button
                        on:click={() => handleNavClick(item.section)}
                        class="w-full text-left px-4 py-3 rounded-xl transition flex items-center gap-2 {currentSection ===
                        item.section
                            ? 'bg-[#E11D48] text-white'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'}"
                    >
                        <span class="text-lg">{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                </li>
            {/each}
        </ul>
    </nav>
</aside>
