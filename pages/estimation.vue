<template>
	<div class="flex flex-col divide-y">
		<header class="w-screen flex flex-row justify-center">
			<div class="w-4xl flex flex-row justify-between py-4">
				<h1 class="w-1/3 text-2xl">Scrum Poker Planner</h1>
				<client-only>
					<span class="w-1/3 text-center text-lg">{{ name }}</span>
					<span class="w-1/3 text-end text-lg">{{ username }}</span>
				</client-only>
			</div>
		</header>
		<main class="w-screen flex flex-grow items-start justify-center py-4">
			<NuxtPage class="w-4xl" />
		</main>
		<footer class="w-screen flex justify-center py-4">
			<div class="w-4xl py-2 text-center">&copy; Felix Grafschmidt {{ new Date().getFullYear() }}</div>
		</footer>
	</div>
</template>

<script setup lang="ts">
	import { nanoid } from "nanoid";

	definePageMeta({
		middleware: [
			async (_, to) => {
				if (!to.params.id) {
					const id = nanoid();
					to.name = "estimation-id-setup";
					to.params = { id };
					return await navigateTo(to);
				}
			},
		],
	});

	const username = useLocalStorage("name", "");

	const name = useState("name");
</script>
