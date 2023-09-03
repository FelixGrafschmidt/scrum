<template>
	<div class="template grid h-full">
		<div class="grid-area-[title] flex flex-row items-center justify-start border-x border-b pl-4">
			<span class="text-3xl font-semibold"> {{ task.name }}</span>
		</div>
		<div class="grid-area-[options] flex flex-col border-l border-r p-4">
			<div v-if="revealed">
				<div v-for="([v, names], i) in votes" :key="i" :class="{ 'text-xl text-green': most === i }">
					{{ names.length }} person(s) voted {{ v }} ({{ names.join(", ") }})
				</div>
			</div>
			<div v-else class="flex flex-col">
				<span> {{ Object.keys(task.votes || []).length }} person(s) connected </span>
				<span> {{ Object.values(task.votes || []).filter((e) => e !== null).length }} person(s) voted so far </span>
			</div>
		</div>
		<div class="grid-area-[secondary] flex flex-col justify-evenly gap-4 border-b border-r p-4">
			<div
				class="h-full w-full flex flex-row cursor-pointer items-center justify-center rounded bg-gray-6 text-xl hover:bg-gray-5"
				@click="copyLink"
			>
				Copy Link
			</div>
			<div
				class="h-full w-full flex flex-row cursor-pointer items-center justify-center rounded bg-gray-6 text-xl hover:bg-gray-5"
				@click="repeatVote"
			>
				Repeat Vote
			</div>
		</div>
		<div class="grid-area-[primary] flex flex-row items-center justify-center border-r px-12">
			<FGButton color="teal" label="Reveal" size="3xl" fullwidth @click="revealed = true" />
		</div>
	</div>
</template>

<script setup lang="ts">
	import Pusher from "pusher-js";

	const task: Ref<Task> = ref({});
	const revealed = ref(false);
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

	onMounted(() => {
		try {
			setupWebSocket();
		} catch (err) {
			console.log(err);
		}
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
			}
		});
	}

	async function repeatVote() {
		const emptyVotes: { [key: string]: string | null } = {};
		Object.keys(task.value.votes!).forEach((name) => {
			emptyVotes[name] = null;
		});
		try {
			await useFetch("/api/repeat", {
				body: { name: task.value.name, options: task.value.options, id: task.value.id, votes: emptyVotes },
				method: "POST",
			});
			revealed.value = false;
		} catch (error) {
			console.error(error);
		}
	}

	async function copyLink() {
		const url = new URL(window.location.href);
		url.pathname = url.pathname.replace("results", "vote");
		await navigator.clipboard.writeText(url.toString());
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
