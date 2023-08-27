<template>
	<div class="flex flex-col">
		<header class="flex flex-row justify-between border-b p-4">
			<h1 class="w-1/3 text-xl">Scrum Poker Planner</h1>
			<client-only>
				<span class="w-1/3 text-center text-lg">{{ name }}</span>
				<span class="w-1/3 text-end text-lg">{{ username }}</span>
			</client-only>
		</header>
		<main class="flex-grow items-start justify-start p-4">
			<NuxtPage />
		</main>
		<footer class="border-t p-4">
			<div py-2 text-center>&copy; Felix Grafschmidt {{ new Date().getFullYear() }}</div>
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
