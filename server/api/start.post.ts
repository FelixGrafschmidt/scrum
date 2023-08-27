import { kv } from "@vercel/kv";

export default defineEventHandler(async (event) => {
	const { name, options, id } = await readBody(event);
	try {
		await kv.set(`estimation-${id}`, JSON.stringify({ name, options, id }));
		return 204;
	} catch (error) {
		console.error(error);
	}
});
