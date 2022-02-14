import { Command } from '../../lib/structures';
import type { Message } from 'whatsapp-web.js';

export class PingCommand extends Command {
	public constructor(context: Command.Context) {
		super(context, {
      aliases: ['ping', 'pong']
    });
	}

	public messageRun(message: Message) {
    message.reply('Pong!');
  }
}
