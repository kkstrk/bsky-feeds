import { AtpAgent } from '@atproto/api';

export default async (env) => {
	let agent;

	try {
		agent = new AtpAgent({ service: 'https://bsky.social' });
  
		await agent.login({
			identifier: `${env.BLUESKY_HANDLE}`,
			password: `${env.BLUESKY_APP_PASSWORD}`,
		});
	} catch (error) {
		console.log('Could not login', error);
	}
  
	return agent;
};