import path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pathToConfig = (file = '') => path.resolve(__dirname, `../../config/${file}`);

export default () => {
	const config = JSON.parse(
		fs.readFileSync(pathToConfig('config.json'), { encoding: 'utf8' })
	);

	for (let feed in config) {
		const { avatar } = config[feed];

		const blob = fs.readFileSync(pathToConfig(avatar));

		let encoding;
		if (avatar.endsWith('.png')) {
			encoding = 'image/png';
		} else if (avatar.endsWith('.jpg') || avatar.endsWith('.jpeg')) {
			encoding = 'image/jpeg';
		}  

		config[feed].avatar = { blob, encoding };
	}
    
	return config;
};