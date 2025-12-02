// @ts-check

import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightThemeRapidePlugin from "starlight-theme-rapide";
import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
    vite: {
        plugins: [tailwindcss()],
    },
    site: "https://mdsreq-fga-unb.github.io",
    base: "/REQ-2025.2-T01-PPBM",
    integrations: [react(), starlight({
        plugins: [starlightThemeRapidePlugin()],
        title: "FireForce - PPBM",
        customCss: [
            // Path to your Tailwind base styles:
            './src/styles/global.css',
        ],
        social: [
            {
                icon: "github",
                label: "GitHub",
                href: "https://github.com/mdsreq-fga-unb/REQ-2025.2-T01-PPBM",
            },
        ],
        sidebar: [
            {
                label: "Início",
                items: [
                    {
                        label: "Sobre o Projeto",
                        slug: "home/sobre",
                    },
                    {
                        label: "Equipe",
                        slug: "home/equipe",
                    },
                ],
            },
            {
                label: "Visão do Produto e Projeto",
                items: [
                    {
                        label: "Cenário Atual do Cliente e do Negócio",
                        slug: "visao/cenario",
                    },
                    {
                        label: "Solução Proposta",
                        slug: "visao/solucao",
                    },
                    {
                        label: "Estratégias de Engenharia de Software",
                        slug: "visao/estrategias",
                    },
                    {
                        label: "Engenharia de Requisitos",
                        slug: "visao/engrequisitos",
                    },
                    {
                        label: "Cronograma e Entregas",
                        slug: "visao/cronograma",
                    },
                    {
                        label: "Interação entre Equipe e Cliente",
                        slug: "visao/interacao",
                    },
                    {
                        label: "Requisitos de Software",
                        slug: "visao/requisitos",
                    },
                    {
                        label: "User Stories",
                        slug: "visao/userstories",
                    },
                    {
                        label: "DoR e DoD",
                        slug: "visao/dod",
                    },
                    {
                        label: "Backlog do Produto",
                        slug: "visao/backlog",
                    }
                ],
            },
            {
                label: "Lições Aprendidas",
                items: [
                    {
                        label: "Unidade 1",
                        slug: "licoes/unidade-1",
                    },
                    {
                        label: "Unidade 2",
                        slug: "licoes/unidade-2",
                    },
                    {
                        label: "Unidade 3",
                        slug: "licoes/unidade-3",
                    }
                ],
            },
            {
                label: "Entregas",
                items: [
                    {
                        label: "Unidade 1",
                        slug: "entregas/unidade-1",
                    },
                    {
                        label: "Unidade 2",
                        slug: "entregas/unidade-2",
                    },
                    {
                        label: "Unidade 3 - Especificações",
                        slug: "entregas/unidade-3-uc",
                    },
                ],
            },
            {
                label: "Evidências",
                items: [
                    {
                        label: "Sprint 0",
                        slug: "evidencias/sprint-0",
                    },
                    {
                        label: "Sprint 1",
                        slug: "evidencias/sprint-1",
                    },
                    {
                        label: "Sprint 2",
                        slug: "evidencias/sprint-2",
                    },
                    {
                        label: "Sprint 3",
                        slug: "evidencias/sprint-3",
                    },
                    {
                        label: "Sprint 4",
                        slug: "evidencias/sprint-4",
                    },
                    {
                        label: "Sprint 5",
                        slug: "evidencias/sprint-5",
                    },
                    {
                        label: "Sprint 6",
                        slug: "evidencias/sprint-6",
                    },
                ],
            },
            {
                label: "Atas de Reunião",
                items: [
                    {
                        label: "01/09/2025",
                        slug: "atas/ata1",
                    },
                    {
                        label: "11/09/2025",
                        slug: "atas/ata2",
                    },
                    {
                        label: "24/09/2025",
                        slug: "atas/ata3",
                    },
                    {
                        label: "01/10/2025",
                        slug: "atas/ata4",
                    },
                    {
                        label: "03/10/2025",
                        slug: "atas/ata5",
                    },
                    {
                        label: "09/10/2025",
                        slug: "atas/ata6",
                    },
                    {
                        label: "13/10/2025",
                        slug: "atas/ata7",
                    },
                    {
                        label: "15/10/2025",
                        slug: "atas/ata8",
                    },
                    {
                        label: "27/10/2025",
                        slug: "atas/ata9",
                    },
                    {
                        label: "29/10/2025",
                        slug: "atas/ata10",
                    },
                    {
                        label: "10/11/2025",
                        slug: "atas/ata11",
                    },
                    {
                        label: "12/11/2025",
                        slug: "atas/ata12",
                    },
                    {
                        label: "24/11/2025",
                        slug: "atas/ata13",
                    },
                    {
                        label: "06/11/2025",
                        slug: "atas/ata14",
                    },
                    {
                        label: "01/12/2025",
                        slug: "atas/ata15",
                    }
                ],
            },
        ],
    })],
});
