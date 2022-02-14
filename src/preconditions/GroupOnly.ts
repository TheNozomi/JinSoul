import type { Message } from 'whatsapp-web.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { Precondition } from '../lib/structures/Precondition';

export class GroupChatOnly extends Precondition {
	public async run(message: Message) {
    const chat = await message.getChat();
    return chat.isGroup
      ? this.ok()
      : this.error({ identifier: Identifiers.PreconditionPrivateOnly, message: 'This command can only be used in a group chat.' });
	}
}
