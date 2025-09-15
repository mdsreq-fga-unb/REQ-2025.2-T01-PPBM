// @ts-check

import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightThemeBlack from "starlight-theme-black";


// https://astro.build/config
export default defineConfig({
	site: "https://mdsreq-fga-unb.github.io",
	base: "/REQ-2025.2-T01-PPBM",
	integrations: [
		starlight({
			plugins: [
				starlightThemeBlack({
					navLinks: [
						{
							label: "Documentação",
							link: "/home/sobre",
						},
						{
							label: "Github",
							link: "https://github.com/mdsreq-fga-unb/REQ-2025.2-T01-PPBM",
						},
					],
					footerText: "FireForce© 2025 - Todos os direitos reservados.",
				}),
			],
			title: "FireForce - PPBM",
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
						},
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
