<template>
	<div>
		<label class="mb-4 w-96 flex flex-col gap-2">
			<span class="text-xl">Title</span>
			<input v-model="title" class="w-96 rounded bg-gray-4 px-2 py-1 text-gray-8" />
		</label>
		<FGButton color="teal" :disabled="!title" label="Start" size="3xl" @click="start" />
	</div>
</template>

<script setup lang="ts">
	const title = ref("");
	const options = ref([0, 1, 2, 3, 5, 8, 13, 20, 42, 100, "?", "Pause"]);

	async function start() {
		try {
			await useFetch("/api/start", {
				body: { name: title.value, options: options.value, id: useRoute().params.id },
				method: "POST",
			});
			return await navigateTo({ name: "estimation-id-results" });
		} catch (error) {
			console.error(error);
		}
	}
</script>
