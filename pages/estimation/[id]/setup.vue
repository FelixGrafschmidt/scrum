<template>
	<div class="template grid h-full">
		<div class="grid-area-[title] w-4xl border-x border-b text-center">
			<label class="w-full flex flex-col items-center gap-1 py-2">
				<span class="text-2xl">Title</span>
				<input v-model="title" class="h-8 w-64 rounded bg-gray-4 px-2 py-1 text-gray-8" />
			</label>
		</div>
		<div class="grid-area-[options] flex flex-col border-l border-r p-2">
			<span class="text-xl">Options</span>
			<div
				class="my-2 max-h-[60vh] flex flex-row flex-wrap overflow-y-auto scrollbar-thumb-color-gray-7 scrollbar-track-color-gray-5 scrollbar-radius-2 scrollbar-thumb-radius-4 scrollbar-track-radius-4 scrollbar-w-2 scrollbar scrollbar-rounded"
			>
				<div
					v-for="(option, i) in options.sort((a, b) => ('' + a).localeCompare(b.toString(), undefined, { numeric: true }))"
					:key="i"
					class="relative m-2 w-47% rounded bg-gray-6 px-4 py-4"
				>
					{{ option }}
					<FGButton icon="fa:remove" size="lg" class="absolute right-4 top-4" color="red" @click="remove(option)" />
				</div>
			</div>
		</div>
		<div class="grid-area-[secondary] flex flex-col justify-evenly gap-4 border-b border-r p-4">
			<div
				class="h-full w-full flex flex-row cursor-pointer items-center justify-center rounded bg-gray-6 text-xl hover:bg-gray-5"
				@click="add"
			>
				Add Option
			</div>
			<div
				class="h-full w-full flex flex-row cursor-pointer items-center justify-center rounded bg-gray-6 text-xl hover:bg-gray-5"
				@click="setDefaultOptions"
			>
				Save as default options
			</div>
			<div
				class="h-full w-full flex flex-row cursor-pointer items-center justify-center rounded bg-gray-6 text-xl hover:bg-gray-5"
				@click="reset"
			>
				Reset to default options
			</div>
		</div>
		<div class="grid-area-[primary] flex flex-row items-center justify-center border-r px-12">
			<FGButton :color="title ? 'teal' : 'gray'" :disabled="!title" label="Start" size="3xl" fullwidth @click="start" />
		</div>
	</div>
</template>

<script setup lang="ts">
	const title = ref("");
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

	function add() {
		const newOption = window.prompt("New value");
		if (newOption) {
			options.value.push(newOption);
		}
	}

	function reset() {
		options.value = useLocalStorage("options", [0, 1, 2, 3, 5, 8, 13, 20, 42, 100, "?", "Pause"]).value;
	}

	async function start() {
		try {
			await useFetch("/api/start", {
				body: { name: title.value, options: options.value, id: useRoute().params.id },
				method: "POST",
			});
			const url = new URL(window.location.href);
			url.pathname = url.pathname.replace("setup", "vote");
			await navigator.clipboard.writeText(url.toString());
			return await navigateTo({ name: "estimation-id-results" });
		} catch (error) {
			console.error(error);
		}
	}
</script>

<style scoped>
	.template {
		grid-template-columns: 1fr 1fr 1fr;
		grid-template-rows: 0.5fr 1fr 1fr 1fr;
		grid-template-areas:
			"title title title"
			"options options secondary"
			"options options secondary"
			"options options primary";
	}
</style>
