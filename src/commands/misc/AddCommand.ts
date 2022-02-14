import { Command } from '../../lib/structures';
import { Args } from '../../lib/parsers/Args';
import type { Message } from 'whatsapp-web.js';

export class AddCommand extends Command {
	public constructor(context: Command.Context) {
		super(context, {
      aliases: ['add', 'sum'],
      description: 'Nothing fancy, just adds two numbers together.',
    });
	}

	public async messageRun(message: Message, args: Args) {
    try {
      const n1 = await args.pick('number');
      const n2 = await args.pick('number');
      await message.reply(`${n1} + ${n2} = ${n1 + n2}`);
    } catch (error) {
      console.error('AddCommand error:', error);
    }
  }
}
