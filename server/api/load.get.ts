import { kv } from "@vercel/kv";

export default defineEventHandler(async (event) => {
	const { id } = getQuery(event);

	try {
		const result: Task | null = await kv.get(`estimation-${id}`);
		if (!result) {
			setResponseStatus(event, 404);
			return;
		}
		return result;
	} catch (error) {
		console.error(error);
		setResponseStatus(event, 500);
	}
});
