<template>
	<div>
		<div>
			<label class="mb-4 flex flex-col gap-2">
				<span class="text-xl">Name</span>
				<input v-model="useLocalStorage('name', '').value" class="w-1/6 rounded bg-gray-4 px-2 py-1 text-gray-8" />
			</label>
		</div>
		<div v-if="task" class="mt-8 w-2/3 flex flex-col">
			<div class="w-full columns-2">
				<div
					v-for="(option, i) in task.options"
					:key="i"
					class="my-2 cursor-pointer rounded bg-gray-6 px-4 py-2 first:my-0 first:mb-2 hover:bg-gray-5"
					@click="vote(option)"
				>
					{{ option }}
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	const task: Ref<Task> = ref({});

	try {
		const { data, error } = await useFetch("/api/load", { params: { id: useRoute().params.id } });
		if (error.value) {
			throw error.value;
		}
		if (!data.value) {
			throw new Error("Error loading data");
		}
		task.value = data.value;
		useState("name").value = data.value.name;
	} catch (error) {
		console.error(error);
	}

	async function vote(option: string) {
		try {
			await useFetch("/api/vote", {
				body: { id: useRoute().params.id, option, username: useLocalStorage("name", "").value },
				method: "POST",
			});
			return await navigateTo({ name: "estimation-id-results" });
		} catch (error) {
			console.error(error);
		}
	}
</script>
