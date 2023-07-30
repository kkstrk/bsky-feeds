import dotenv from 'dotenv';

import getConfig from './utils/getConfig.mjs';
import getAtpAgent from './utils/getAtpAgent.mjs';
import createRecord from './utils/createRecord.mjs';

const publishFeeds = async () => {  
	const agent = await getAtpAgent();
	const config = getConfig();
	for (let feed in config) {
		await publishFeed(agent, config[feed]);
	}
};

const publishFeed = async (
	agent,
	{
		recordKey,
		displayName,
		description,
		avatar: { blob, encoding } = {},
	}
) => {
	let avatar;
	if (blob && encoding) {
		const response = await agent.api.com.atproto.repo.uploadBlob(blob, { encoding });
		avatar = response.data.blob;
	}

	const record = createRecord(
		agent,
		{
			rkey: recordKey,
			record: {
				did: `did:web:${process.env.CLOUDFLARE_WORKER_URL}`,
				displayName,
				description,
				avatar,
				createdAt: new Date().toISOString(),
			},
		}
	);

	console.log(`Publishing record: ${JSON.stringify(record, null, 2)}`);
	await agent.api.com.atproto.repo.putRecord(record);
};

dotenv.config();
publishFeeds();
