export default async (agent, params) => {
	const result = { posts: [], cursor: '' };

	try {
		const response = await agent.api.app.bsky.feed.searchPosts(params);
		result.posts.push(...response.data.posts);
		result.cursor = response.data.cursor;
	} catch (error) {
		console.log('Could not fetch search posts', error);
	}

	return result;
};
