<template>
	<div v-if="task.votes?.[useLocalStorage('name', '').value]">
		<div v-if="revealed">
			<div v-for="([v, names], i) in votes" :key="i" :class="{ 'text-xl text-green': most === i }">
				{{ names.length }} person(s) voted {{ v }} ({{ names.join(", ") }})
			</div>
		</div>
		<div v-else>
			<span>
				{{ Object.keys(task.votes || []).length }} person(s) voted so far (Your vote:
				{{ task.votes?.[useLocalStorage("name", "").value] }})
			</span>
			<FGButton class="mt-4" color="teal" label="Reveal" size="3xl" @click="revealed = true" />
		</div>
	</div>
	<div v-else>
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

	onMounted(async () => {
		try {
			await $fetch("/api/register", {
				body: { id: useRoute().params.id, username: useLocalStorage("name", "").value },
				method: "POST",
			});
		} catch (error) {
			console.error(error);
		}

		try {
			setupWebSocket();
		} catch (err) {
			console.log(err);
		}

		// TODO: Does not work correctly, "visibiltychange" is also fired when the user switches to another tab
		// document.addEventListener("visibilitychange", async function logData() {
		// 	if (document.visibilityState === "hidden") {
		// 		await useFetch("/api/unregister", {
		// 			body: { id: useRoute().params.id, username: useLocalStorage("name", "").value },
		// 			method: "POST",
		// 			keepalive: true,
		// 		});
		// 	}
		// });
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

	async function vote(option: string) {
		try {
			await useFetch("/api/vote", {
				body: { id: useRoute().params.id, option, username: useLocalStorage("name", "").value },
				method: "POST",
			});
		} catch (error) {
			console.error(error);
		}
	}
</script>
