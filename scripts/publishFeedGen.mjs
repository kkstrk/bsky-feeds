import dotenv from 'dotenv';
import path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

import getAtpAgent from './utils/getAtpAgent.mjs';
import createRecord from './utils/createRecord.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pathToConfig = (file = '') => path.resolve(__dirname, `../config/${file}`);

const publishFeeds = async () => {  
  const agent = await getAtpAgent();

  const configs = fs.readdirSync(pathToConfig())
    .filter((file) => file.endsWith('.json'))
    .map((file) => JSON.parse(
      fs.readFileSync(pathToConfig(file), { encoding: 'utf8' }))
    );

  configs.forEach(async (config) => {
    await publishFeed(agent, config);
  });
}

const publishFeed = async (agent, config) => {
  const {
    recordKey,
    displayName,
    description,
    avatar,
    draft,
  } = config;

  if (draft) {
    console.log(`Skipped publishing: '${recordKey}'`);
    return;
  }

  let avatarRef;
  if (avatar) {
    let encoding;
    if (avatar.endsWith('png')) {
      encoding = 'image/png';
    } else if (avatar.endsWith('jpg') || avatar.endsWith('jpeg')) {
      encoding = 'image/jpeg';
    } else {
      throw new Error('expected png or jpeg');
    }
    const img = fs.readFileSync(pathToConfig(avatar));
    const blobRes = await agent.api.com.atproto.repo.uploadBlob(img, { encoding });
    avatarRef = blobRes.data.blob;
  }

  const record = createRecord(
    agent,
    {
      rkey: recordKey,
      record: {
        did: `did:web:${process.env.CLOUDFLARE_WORKER_URL}`,
        displayName,
        description,
        avatar: avatarRef,
        createdAt: new Date().toISOString(),
      },
    }
  );

  console.log(`Publishing record: ${JSON.stringify(record, null, 2)}`);
  await agent.api.com.atproto.repo.putRecord(record);
}

dotenv.config();
publishFeeds();
