export default async (agent, list) => {
	const result = [];

	try {
		const params = {
			list,
			limit: 30,
			// TODO: handle pagination
			// cursor: '',
		};
		const response = await agent.api.app.bsky.graph.getList(params);
		result.push(...response.data.items);
	} catch (error) {
		console.error('Could not fetch list', error);
	}

	return result;
};
