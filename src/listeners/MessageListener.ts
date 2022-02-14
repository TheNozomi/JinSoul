import { Listener } from '../lib/structures';
import { Events } from '../lib/types';
import type { Message } from 'whatsapp-web.js';

export class MessageListener extends Listener<typeof Events.MessageCreate> {
  public constructor(context: Listener.Context) {
    super(context, { event: Events.MessageCreate });
  }

  public run(message: Message) {
    console.log('Incoming message:', message);

    if (message.type === 'chat' && message.body === 'ping') {
      message.reply('pong');
    }
  }
}
