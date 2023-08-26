<template>
	<div class="flex flex-col">
		<header class="flex flex-row justify-between border-b p-4 text-xl">
			<h1>Scrum Poker Planner</h1>
			<span>{{ id }}</span>
		</header>
		<main class="flex-grow items-start justify-start p-4">
			<div
				class="h-72 w-48 flex flex-row cursor-pointer items-center justify-center border rounded bg-gray-7 hover:bg-gray-6"
				@click="newSession = true"
			>
				<span class="text-2xl">New</span>
			</div>
			<div v-for="(session, i) in sessions" :key="i" class="h-48 w-24 border rounded bg-gray-7">
				{{ session }}
			</div>
		</main>
		<footer class="border-t p-4">
			<div py-2 text-center>&copy; Felix Grafschmidt {{ new Date().getFullYear() }}</div>
		</footer>
		<Teleport v-if="newSession" to="body">
			<div
				class="absolute inset-0 grid h-screen w-[100vw] bg-gray-9 opacity-90"
				aria-role="dialog"
				aria-modal
				@click="newSession = false"
			></div>
			<div class="absolute inset-0 m-auto h-xl w-4xl flex flex-col items-center justify-start gap-4 rounded bg-gray-7 py-8">
				<label class="w-96 flex flex-col gap-2">
					<span class="text-xl">Title</span>
					<input v-model="title" class="mx-2 w-96 rounded bg-gray-4 px-2 py-1 text-gray-8" />
				</label>
				<div class="w-96 flex flex-col">
					<span class="mb-2 text-xl">Options</span>
					<div class="mx-2 w-full columns-2">
						<div
							v-for="(option, i) in options"
							:key="i"
							class="my-2 cursor-pointer border-2 rounded bg-gray-6 px-4 py-2 first:my-0 first:mb-2"
							:class="{ 'border-teal': selectedOptions.includes(option), 'border-gray-6': !selectedOptions.includes(option) }"
							@click="
								selectedOptions.includes(option)
									? (selectedOptions = selectedOptions.filter((o) => o !== option))
									: selectedOptions.push(option)
							"
						>
							{{ option }}
						</div>
					</div>
				</div>
				<div>
					<FGButton color="teal" :disabled="!title" label="Done" size="3xl" />
				</div>
			</div>
		</Teleport>
	</div>
</template>

<script setup lang="ts">
	import { nanoid } from "nanoid";

	interface Session {
		id: string;
		title: string;
		votes: number[];
	}

	definePageMeta({
		middleware: [
			async (_, to) => {
				if (process.client) {
					let id = "";
					if (to.query.id) {
						return;
					} else if (window.localStorage.getItem("id")) {
						id = window.localStorage.getItem("id")!;
					} else {
						id = nanoid();
					}
					const target = to;
					target.query.id = id;
					return await navigateTo(target);
				}
			},
		],
	});

	const id = ref("");
	const newSession = ref(false);
	const options = ref([0, 1, 2, 3, 5, 8, 13, 20, 42, 100, "?", "Pause"]);
	const selectedOptions = ref([0, 1, 2, 3, 5, 8, 13, 20, 42, 100, "?", "Pause"]);
	const title = ref("");

	const sessions: Ref<Session[]> = useLocalStorage("sessions", []);

	onMounted(() => {
		if (!window.localStorage.getItem("sessions")) {
			window.localStorage.setItem("sessions", JSON.stringify([]));
		}
		id.value = window.localStorage.getItem("id")!;
	});
</script>
