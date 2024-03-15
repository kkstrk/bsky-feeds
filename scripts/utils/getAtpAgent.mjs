import AtprotoApi from '@atproto/api';

export default async () => {
	const agent = new AtprotoApi.AtpAgent({ service: 'https://bsky.social' });

	await agent.login({
		identifier: `${process.env.BLUESKY_HANDLE}`,
		password: `${process.env.BLUESKY_APP_PASSWORD}`,
	});

	return agent;
};