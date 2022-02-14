import type { PieceContext } from '@sapphire/pieces';
import type { Message } from 'whatsapp-web.js';
import { Listener } from '../../lib/structures/Listener';
import { Events } from '../../lib/types/Events';

export class CoreListener extends Listener<typeof Events.MessageCreate> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.MessageCreate });
	}

	public run(message: Message) {
		// Don't run commands if it's not a chat message or if the message is from the bot
		if (message.type !== 'chat' || message.fromMe) return;

		// Run the message parser.
		this.container.client.emit(Events.PreMessageParsed, message);
	}
}
