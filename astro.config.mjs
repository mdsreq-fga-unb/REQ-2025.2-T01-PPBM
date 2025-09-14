// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightThemeRapide from 'starlight-theme-rapide'

// https://astro.build/config
export default defineConfig({
	site: "https://mdsreq-fga-unb.github.io",
	base: "/REQ-2025.2-T01-PPBM",
	integrations: [
		starlight({
			plugins: [starlightThemeRapide()],
			title: "PPBM - 2025.2",
			social: [
				{
					icon: "github",
					label: "GitHub",
					href: "https://github.com/mdsreq-fga-unb/REQ-2025.2-T01-PPBM",
				},
			],
			sidebar: [
				{
					label: "Sobre",
					items: [
						{
							label: "PPBM",
							slug: "sobre",
						},
					],
				},
				{
					label: "Visão Produto e Projeto",
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
							label: "Cronograma e Entregas",
							slug: "visao/cronograma",
						},
						{
							label: "Interação entre Equipe e Cliente",
							slug: "visao/interacao",
						},
						{
							label: "Referências Bibliográficas",
							slug: "visao/referencias",
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
					],
				},
			],
		}),
	],
});
