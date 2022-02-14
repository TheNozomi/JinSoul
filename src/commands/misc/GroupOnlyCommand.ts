import { Command } from '../../lib/structures';
import type { Message } from 'whatsapp-web.js';

export class GroupOnlyCommand extends Command {
	public constructor(context: Command.Context) {
		super(context, {
      aliases: ['test1'],
      preconditions: ['GroupOnly']
    });
	}

	public messageRun(message: Message) {
    message.reply('Hello from GroupOnlyCommand');
  }
}
