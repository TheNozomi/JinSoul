import { Listener } from '../lib/structures';
import { Events } from '../lib/types';

export class CoreEvent extends Listener<typeof Events.Ready> {
	public constructor(context: Listener.Context) {
		super(context, { event: Events.Ready, once: true });
	}

	public run() {
    console.log('Client ready!');
		this.container.client.id ??= this.container.client.info?.wid ?? null;
	}
}
