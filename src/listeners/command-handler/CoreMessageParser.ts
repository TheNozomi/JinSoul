import type { PieceContext } from '@sapphire/pieces';
import { Message } from 'whatsapp-web.js';
import { Listener } from '../../lib/structures/Listener';
import { Events } from '../../lib/types/Events';

export class CoreListener extends Listener<typeof Events.PreMessageParsed> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.PreMessageParsed });
	}

	public async run(message: Message) {
    const chat = await message.getChat();
		// If the bot cannot run the command due to lack of permissions, return.
		if (chat.isReadOnly) return;

		let prefix = null;
		const { client } = this.container;
		const { regexPrefix } = client.options;
		if (regexPrefix?.test(message.body)) {
			prefix = regexPrefix;
		} else {
			const prefixes = await client.fetchPrefix(message);
			const parsed = this.getPrefix(message.body, prefixes);
			if (parsed !== null) prefix = parsed;
		}

		if (prefix === null) client.emit(Events.NonPrefixedMessage, message);
		else client.emit(Events.PrefixedMessage, message, prefix);
	}

	private getPrefix(content: string, prefixes: readonly string[] | string | null): string | null {
		if (prefixes === null) return null;
		const { caseInsensitivePrefixes } = this.container.client.options;

		if (caseInsensitivePrefixes) content = content.toLowerCase();

		if (typeof prefixes === 'string') {
			return content.startsWith(caseInsensitivePrefixes ? prefixes.toLowerCase() : prefixes) ? prefixes : null;
		}

		return prefixes.find((prefix) => content.startsWith(caseInsensitivePrefixes ? prefix.toLowerCase() : prefix)) ?? null;
	}
}
