/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				primary: {
					DEFAULT: '#E11D48',
					dark: '#BE123C',
				},
			},
			boxShadow: {
				soft: '0 10px 30px rgba(0,0,0,.08), 0 6px 10px rgba(0,0,0,.06)',
			},
		},
	},
	plugins: [],
}

