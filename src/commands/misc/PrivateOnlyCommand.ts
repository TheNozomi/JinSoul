import { Command } from '../../lib/structures';
import type { Message } from 'whatsapp-web.js';

export class PrivateOnlyCommand extends Command {
	public constructor(context: Command.Context) {
		super(context, {
      aliases: ['test2'],
      preconditions: ['PrivateOnly']
    });
	}

	public messageRun(message: Message) {
    message.reply('Hello from PrivateOnlyCommand');
  }
}
