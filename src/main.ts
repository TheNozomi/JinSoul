import { env } from './lib/environment';
import { JinSoulClient } from './lib/JinSoulClient';

(async () => {
  const client = new JinSoulClient({});
  console.log('Environment:', env);

  await client.login();
})().catch(err => {
  console.error('Fatal error', err);
  process.exit(1);
});
