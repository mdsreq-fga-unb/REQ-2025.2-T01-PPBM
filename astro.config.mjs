// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: "https://mdsreq-fga-unb.github.io",
	base: "/REQ-2025.2-T01-PPBM",
	integrations: [
		starlight({
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
					label: "Home",
					items: [
						{
							label: "Home",
							slug: "home",
						},
					],
				},
				{
					label: "Unidades",
					items: [
						{
							label: "Unidade 1 - Introdução",
							slug: "unidade-1",
						},
						{
							label: "Unidade 2 - Planejamento e Análise",
							slug: "unidade-2",
						},
						{
							label: "Unidade 3 - Design e Arquitetura",
							slug: "unidade-3",
						},
					],
				}
			],
		}),
	],
});
