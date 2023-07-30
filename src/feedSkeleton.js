import config from '../config/config.json';
import getList from './api/getList';
import getPosts from './api/getPosts';
import getSearchPosts from './api/getSearchPosts';
import login from './api/login';
import jsonResponse from './utils/jsonResponse';

const getPostUri = (post) => {
	const {
		user: { did },
		tid,
	} = post;

	return `at://${did}/${tid}`;
};

const filterPosts = (posts, filters) => {
	const {
		userBlacklist,
		filter,
	} = filters;

	return posts.filter((post) => {
		const {
			user: { did },
			_embed = {},
			_reply,
		} = post;

		if (userBlacklist.includes(did)) {
			return false;
		}

		if (filter.embed?.images && _embed.images === false) {
			return false;
		}

		if (filter.reply && _reply === false) {
			return false;
		}

		return true;
	});
};

const sortPosts = (posts) => {
	return posts.toSorted((a, b) => {
		return b.post.createdAt - a.post.createdAt;
	});
};

const parsePosts = (posts) => {
	return posts.map((post) => ({ post: getPostUri(post) }));
};

export default async (request, env) => {
	const urlParams = new URL(request.url).searchParams;

	const feedParam = urlParams.get('feed');
	const feedKey = feedParam.split('/').pop();
	const { filter, blacklist } = config[feedKey];

	const limitParam = urlParams.get('limit') || '';
	const limit = limitParam ? parseInt(limitParam) : 30;

	const cursorParam = urlParams.get('cursor') || '';
	const [, offsetParam] = cursorParam.split(':');
	const offset = offsetParam ? parseInt(offsetParam) : 0;

	const searchPosts = await getSearchPosts({
		q: filter.text,
		offset,
		count: limit,
	});

	const shouldLogin = !!(blacklist || filter.embed);
	const agent = shouldLogin ? await login(env) : undefined;

	let userBlacklist = [];
	if (agent && blacklist) {
		const getListData = await getList(agent, blacklist);
		if (getListData.length) {
			userBlacklist = getListData.map(({ subject }) => subject.did);
		}
	}

	let posts = searchPosts;
	if (agent && searchPosts.length) {
		const getPostsData = await getPosts(agent, searchPosts.map(getPostUri));
		if (getPostsData.length) {
			posts = searchPosts.map((post) => {
				const match = getPostsData.find(({ cid }) => cid === post.cid);
				if (match) {
					post._embed = {
						// external: !!match.embed?.external,
						images: !!match.embed?.images,
					};
					post._reply = !!match.record.reply;
				}
				return post;
			});
		}
	}

	const filteredPosts = filterPosts(posts, { userBlacklist, filter });
	const sortedPosts = sortPosts(filteredPosts);
	const parsedPosts = parsePosts(sortedPosts);

	const response = { feed: parsedPosts };
	if (searchPosts.length >= limit) {
		response.cursor = `${Date.now()}:${offset + limit}`;
	}

	return jsonResponse(response);
};