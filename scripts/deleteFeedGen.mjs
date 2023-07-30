import dotenv from 'dotenv';

import getAtpAgent from './utils/getAtpAgent.mjs';
import createRecord from './utils/createRecord.mjs';

const deleteFeed = async () => {
	const agent = await getAtpAgent();

	const record = createRecord(
		agent,
		{ rkey: `${process.env.RECORD_KEY}` }
	);

	console.log(`Deleting record: ${JSON.stringify(record, null, 2)}`);
	await agent.api.com.atproto.repo.deleteRecord(record);
};

dotenv.config();
deleteFeed();
