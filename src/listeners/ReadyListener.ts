import { Listener } from '../lib/structures';
import { Events } from '../lib/types';

export class ReadyListener extends Listener<typeof Events.Ready> {
  public constructor(context: Listener.Context) {
    super(context, { event: Events.Ready });
  }

  public run() {
    console.log('Client ready!');
  }
}
