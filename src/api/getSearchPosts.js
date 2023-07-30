export default async (params) => {
	let result = [];

	try {
		if (params.count < 1) {
			delete params.count;
		}

		if (params.offset < 1) {
			delete params.offset;
		}

		const url = 'https://search.bsky.social/search/posts?' + new URLSearchParams(params);
		const response = await fetch(url);
		result = response.json();
	} catch (error) {
		console.log('Could not fetch search posts', error);
	}

	return result;
};
