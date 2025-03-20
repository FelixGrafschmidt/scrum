// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
 devtools: { enabled: true },
 modules: ["@pinia/nuxt", "@unocss/nuxt", "nuxt-icon", "@vueuse/nuxt", "ui.felgraf.dev"],
 vite: {},

 app: {
					head: {
									title: "Scrum Poker Planner",
					},
	},

 compatibilityDate: "2025-03-20",
});