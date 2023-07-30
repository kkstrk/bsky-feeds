import AtprotoApi from '@atproto/api';

export default async () => {
	const agent = new AtprotoApi.AtpAgent({ service: 'https://bsky.social' });

	await agent.login({
		identifier: `${process.env.BLUESKY_HANDLE}`,
		password: `${process.env.BLUESKY_APP_PASSWORD}`,
	});

	try {
		await agent.api.app.bsky.feed.describeFeedGenerator();
	} catch (err) {
		throw new Error(
			'The bluesky server is not ready to accept published custom feeds yet',
		);
	}

	return agent;
};