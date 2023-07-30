import wellKnown from './wellKnown';
import feedSkeleton from './feedSkeleton';

export default {
	async fetch(request, env) {
		if (request.url.endsWith('/.well-known/did.json')) {
			return await wellKnown(request);
		}

		if (request.url.includes('/xrpc/app.bsky.feed.getFeedSkeleton')) {
			return await feedSkeleton(request, env);
		}

		return new Response('Hello World!');
	},
};
