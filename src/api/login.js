import { AtpAgent } from '@atproto/api';

const namespace = 'bsky-auth';
const key = 'session';

export default async (env) => {
	let agent;
	let resumed = false;

	try {
		agent = new AtpAgent({
			service: 'https://bsky.social',
			persistSession: async (event, session) => {
				console.log('persistSession', { event, session });
				if (session) {
					try {
						await env[namespace].put(key, JSON.stringify(session));
					} catch (error) {
						console.error('Could not store session data', error);
					}
				}
			}
		});

		try {
			console.log('Resuming session...');
			const storedSession = await env[namespace].get(key, 'json', { cacheTtl: 1_800 });
			if (storedSession) {
				await agent.resumeSession(storedSession);
				resumed = true;
			}
		} catch (error) {
			console.error('Could not resume session', error);
		}

		if (!resumed) {
			console.log('Logging in...');
			try {
				await agent.login({
					identifier: `${env.BLUESKY_HANDLE}`,
					password: `${env.BLUESKY_APP_PASSWORD}`,
				});
			} catch {
				console.log('Using backup account...');
				await agent.login({
					identifier: `${env.BLUESKY_BACKUP_HANDLE}`,
					password: `${env.BLUESKY_BACKUP_APP_PASSWORD}`,
				});
			}

		}
	} catch (error) {
		console.error('Could not login', error);
		throw error;
	}
  
	return agent;
};