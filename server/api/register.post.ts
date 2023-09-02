import { kv } from "@vercel/kv";
import Pusher from "pusher";

const pusher = new Pusher({
	appId: process.env.PUSHER_APPID || "",
	key: "ef5a21a130e6e5d39994",
	secret: process.env.PUSHER_SECRET || "",
	cluster: "eu",
	useTLS: true,
});

export default defineEventHandler(async (event) => {
	const { username, id } = await readBody(event);

	if (!username) {
		setResponseStatus(event, 400);
		return;
	}
	if (!id) {
		setResponseStatus(event, 400);
		return;
	}

	try {
		const task: Task = (await kv.get(`estimation-${id}`))!;
		if (!task.votes) {
			task.votes = {};
		}
		task.votes[username.toString()] = null;
		await kv.set(`estimation-${id}`, task);
		await pusher.trigger(id.toString(), "update", task);
		return 204;
	} catch (error) {
		console.error(error);
		setResponseStatus(event, 500);
	}
});
