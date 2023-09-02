<template>
	<div>
		<label class="mb-4 flex flex-col gap-2">
			<span class="text-xl">Title</span>
			<input v-model="title" class="w-38 rounded bg-gray-4 px-2 py-1 text-gray-8" />
		</label>
		<section class="mb-4">
			<div class="flex flex-row gap-4">
				<span class="text-xl">Options</span>
				<FGButton color="gray" label="Save as default" size="lg" @click="setDefaultOptions()" />
			</div>
			<div class="mt-2 w-80 columns-2">
				<div
					v-for="(option, i) in options"
					:key="i"
					class="my-2 cursor-pointer rounded bg-gray-6 px-4 py-2 first:my-0 first:mb-2 hover:bg-red-5"
					@click="remove(option)"
				>
					{{ option }}
				</div>
			</div>
			<div class="my-2 w-80 flex flex-row justify-between gap-4 rounded bg-gray-5 px-2 py-2 first:my-0 first:mb-2">
				<input
					v-model="newOption"
					placeholder="New Option"
					class="w-36 rounded bg-gray-4 px-2 py-1 text-gray-8 placeholder-text-gray-5"
				/>
				<FGButton
					color="gray"
					:disabled="!newOption"
					label="Add option"
					size="xl"
					@click="
						options.push(newOption);
						newOption = '';
					"
				/>
			</div>
		</section>
		<FGButton color="teal" :disabled="!title" label="Start" size="3xl" @click="start" />
	</div>
</template>

<script setup lang="ts">
	const title = ref("");
	const newOption = ref("");
	const options: Ref<(string | number)[]> = ref([]);

	onMounted(() => {
		options.value = useLocalStorage("options", [0, 1, 2, 3, 5, 8, 13, 20, 42, 100, "?", "Pause"]).value;
	});

	function setDefaultOptions() {
		useLocalStorage("options", [0, 1, 2, 3, 5, 8, 13, 20, 42, 100, "?", "Pause"]).value = options.value;
	}

	function remove(option: string | number) {
		if (window.confirm(`Remove ${option}?`)) {
			options.value = options.value.filter((o) => o !== option);
		}
	}

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
