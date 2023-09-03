<template>
	<div class="template grid h-full">
		<div class="grid-area-[title] flex flex-row items-center justify-start border-x border-b pl-4">
			<span class="text-3xl font-semibold"> {{ task.name }}</span>
		</div>
		<div class="grid-area-[name] border-b border-r">
			<label class="w-full flex flex-col gap-1 px-4 py-2">
				<span class="text-2xl">Name</span>
				<input v-model="useLocalStorage('name', '').value" class="h-8 w-64 rounded bg-gray-4 px-2 py-1 text-gray-8" />
			</label>
		</div>
		<div class="grid-area-[options] border-x">
			<div
				class="mx-2 my-4 max-h-[60vh] flex flex-row flex-wrap overflow-y-auto scrollbar-thumb-color-gray-7 scrollbar-track-color-gray-5 scrollbar-radius-2 scrollbar-thumb-radius-4 scrollbar-track-radius-4 scrollbar-w-2 scrollbar scrollbar-rounded"
			>
				<div
					v-for="(option, i) in task.options?.sort((a, b) => ('' + a).localeCompare(b, undefined, { numeric: true }))"
					:key="i"
					class="m-2 w-47% border rounded bg-gray-6 px-4 py-4"
					:class="{
						'cursor-pointer hover:bg-gray-5 opacity-100': !voted,
						'opacity-70': voted,
						'border-teal': option.toString() === yourvote.toString(),
						'border-gray-6': option.toString() !== yourvote.toString(),
					}"
					@click="voted ? undefined : vote(option)"
				>
					{{ option }}
				</div>
			</div>
		</div>
		<div class="grid-area-[secondary] border-r p-4">
			<div v-if="revealed">
				<div v-for="([v, names], i) in votes" :key="i" :class="{ 'text-xl text-green': most === i }">
					{{ names.length }} person(s) voted {{ v }} ({{ names.join(", ") }})
				</div>
			</div>
			<div v-else class="flex flex-col">
				<span> {{ Object.keys(task.votes || []).length }} person(s) connected </span>
				<span> {{ Object.values(task.votes || []).filter((e) => e !== null).length }} person(s) voted so far </span>
				<FGButton v-if="voted" class="mt-4" color="teal" label="Reveal" size="3xl" @click="revealed = true" />
			</div>
		</div>
		<div class="grid-area-[primary] border-r"></div>
	</div>
</template>

<script setup lang="ts">
	import Pusher from "pusher-js";
	import { add } from "unload";

	const task: Ref<Task> = ref({});
	const voted = ref(false);
	const revealed = ref(false);
	const yourvote = ref("");
	const most = computed(() => {
		let result = -1;
		let value = -1;
		votes.value.forEach(([, names], i) => {
			if (names.length > value) {
				value = names.length;
				result = i;
			}
		});
		return result;
	});

	const votes = computed(() => {
		if (!task.value.votes) {
			return [];
		}
		const result: Record<string, string[]> = {};
		Object.entries(task.value.votes).forEach(([name, vote]) => {
			if (vote === null) {
				return;
			}
			if (!result[vote]) {
				result[vote] = [];
			}
			result[vote].push(name);
		});

		const sorted = Object.entries(result).sort(([first], [second]) => {
			if (first.length > second.length) {
				return 1;
			} else if (second.length > first.length) {
				return -1;
			} else {
				return 0;
			}
		});

		return sorted;
	});

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

	onMounted(async () => {
		try {
			setupWebSocket();
		} catch (err) {
			console.log(err);
		}

		try {
			await $fetch("/api/register", {
				body: { id: useRoute().params.id, username: useLocalStorage("name", "").value },
				method: "POST",
			});
		} catch (error) {
			console.error(error);
		}

		add(async () => {
			await useFetch("/api/unregister", {
				body: { id: useRoute().params.id, username: useLocalStorage("name", "").value },
				method: "POST",
				keepalive: true,
			});
		});
	});

	function setupWebSocket() {
		const pusher = new Pusher("ef5a21a130e6e5d39994", {
			cluster: "eu",
		});

		const channelName = useRoute().params.id;

		if (!channelName) {
			return;
		}

		const channel = pusher.subscribe(channelName.toString());
		channel.bind("update", function (data: Task) {
			if (data.id === useRoute().params.id) {
				task.value = data;
				if (!data.votes?.[useLocalStorage("name", "").value]) {
					voted.value = false;
					revealed.value = false;
				}
			}
		});
	}

	async function vote(option: string) {
		try {
			await useFetch("/api/vote", {
				body: { id: useRoute().params.id, option, username: useLocalStorage("name", "").value },
				method: "POST",
			});
			voted.value = true;
			yourvote.value = option;
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
			"title title name"
			"options options secondary"
			"options options secondary"
			"options options secondary";
	}
</style>
