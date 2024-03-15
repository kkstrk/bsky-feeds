import config from '../config/config.json';
import getList from './api/getList';
import getSearchPosts from './api/getSearchPosts';
import login from './api/login';
import jsonResponse from './utils/jsonResponse';

const filterPosts = (posts, filters) => {
	const {
		userBlacklist,
		filter,
	} = filters;

	return posts.filter((post) => {
		const {
			author: { did },
			embed = {},
		} = post;

		if (userBlacklist.includes(did)) {
			return false;
		}

		if (filter.embed?.images && !embed.images?.length) {
			return false;
		}

		return true;
	});
};

const sortPosts = (posts) => {
	return posts.toSorted((a, b) => {
		return b.record.createdAt - a.record.createdAt;
	});
};

const parsePosts = (posts) => {
	return posts.map((post) => ({ post: post.uri }));
};

export default async (request, env) => {
	const urlParams = new URL(request.url).searchParams;

	const feedParam = urlParams.get('feed');
	const feedKey = feedParam.split('/').pop();
	const { filter, blacklist } = config[feedKey];

	const limitParam = urlParams.get('limit') || '';
	const limit = limitParam ? parseInt(limitParam) : 30;

	const cursorParam = urlParams.get('cursor') || '';

	const agent = await login(env);

	let userBlacklist = [];
	if (agent && blacklist) {
		const getListData = await getList(agent, blacklist);
		if (getListData.length) {
			userBlacklist = getListData.map(({ subject }) => subject.did);
		}
	}

	const { posts, cursor } = await getSearchPosts(agent, {
		q: filter.text,
		limit,
		cursor: cursorParam,
	});

	const filteredPosts = filterPosts(posts, { userBlacklist, filter });
	const sortedPosts = sortPosts(filteredPosts);
	const parsedPosts = parsePosts(sortedPosts);

	return jsonResponse({ feed: parsedPosts, cursor });
};