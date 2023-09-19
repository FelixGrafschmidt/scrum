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
	const { name, options, id } = await readBody(event);
	try {
		let votes = {};
		const task = await kv.get(`estimation-${id}`);
		if ((task as Task)?.votes) {
			votes = (task as Task).votes!;
		}
		await kv.set(`estimation-${id}`, JSON.stringify({ name, options, id, votes }));
		await pusher.trigger(id, "update", { name, options, id, votes });
		return 204;
	} catch (error) {
		console.error(error);
	}
});
