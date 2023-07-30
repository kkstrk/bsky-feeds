const MAX_URIS_LEN = 25;

export default async (agent, uris) => {
	const result = [];

	try {
		for (let i = 0; i < uris.length; i += MAX_URIS_LEN) {
			const params = { uris: uris.slice(i, i + MAX_URIS_LEN) };
			const response = await agent.api.app.bsky.feed.getPosts(params);
			result.push(...response.data.posts);
		}
	} catch (error) {
		console.log('Could not fetch posts', error);
	}

	return result;
};
