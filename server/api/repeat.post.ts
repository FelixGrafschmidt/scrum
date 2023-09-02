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
	const task = await readBody(event);
	try {
		await kv.set(`estimation-${task.id}`, JSON.stringify(task));
		await pusher.trigger(task.id, "update", task);
		return 204;
	} catch (error) {
		console.error(error);
	}
});
