import { Listener } from '../lib/structures';
import { Events } from '../lib/types';
import type { ClientSession } from 'whatsapp-web.js';

import { resolve } from 'path';
import { writeFile } from 'fs/promises';

export class CoreEvent extends Listener<typeof Events.Authenticated> {
	public constructor(context: Listener.Context) {
		super(context, { event: Events.Authenticated, once: true });
	}

	public run(session: ClientSession) {
    // TODO: save to redis
    const sessionFilePath = resolve(__dirname, '../../session.json');

    try {
      writeFile(sessionFilePath, JSON.stringify(session, null, 2), 'utf8');
      console.log(`Session saved to ${sessionFilePath}`);
    } catch (error) {
      console.error('Error saving session to file:', error);
    }
	}
}
