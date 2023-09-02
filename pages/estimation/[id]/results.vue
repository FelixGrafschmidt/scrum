<template>
	<div>
		<FGButton label="Copy Link" size="2xl" class="mb-2" @click="copyLink" />
		<div v-if="revealed">
			<div v-for="([vote, names], i) in votes" :key="i" :class="{ 'text-xl text-green': most === i }">
				{{ names.length }} person(s) voted {{ vote }} ({{ names.join(", ") }})
			</div>
		</div>
		<div v-else class="flex flex-col">
			<span> {{ Object.keys(task.votes || []).length }} person(s) connected </span>
			<span> {{ Object.values(task.votes || []).filter((e) => e !== null).length }} person(s) voted so far </span>
			<FGButton class="mt-4" color="teal" label="Reveal" size="3xl" @click="revealed = true" />
		</div>
		<div mt-4>
			<FGButton label="Repeat Vote" class="mb-2" @click="repeatVote" />
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
		try {
			await useFetch("/api/repeat", {
				body: { name: task.value.name, options: task.value.options, id: task.value.id, votes: {} },
				method: "POST",
			});
			return await navigateTo({ name: "estimation-id-results" });
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
