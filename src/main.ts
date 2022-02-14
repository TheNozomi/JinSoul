import { resolve } from 'path';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';

import { env } from './lib/environment';
import { JinSoulClient } from './lib/JinSoulClient';

(async () => {
  const sessionFilePath = resolve(__dirname, '../session.json');
  let sessionData;

  if (existsSync(sessionFilePath)) {
    try {
      sessionData = JSON.parse(await readFile(sessionFilePath, 'utf8'));
    } catch (error) {
      console.error('Error loading session from file:', error);
    }
  }

  const client = new JinSoulClient({
    defaultPrefix: '!',
    session: sessionData,
  });

  console.log('Environment:', env);
  await client.login();
})().catch(err => {
  console.error('Fatal error', err);
  process.exit(1);
});
