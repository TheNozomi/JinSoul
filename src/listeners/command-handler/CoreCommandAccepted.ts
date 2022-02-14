import type { PieceContext } from '@sapphire/pieces';
import { fromAsync, isErr } from '@sapphire/result';
import { Listener } from '../../lib/structures/Listener';
import { CommandAcceptedPayload, Events } from '../../lib/types/Events';

export class CoreListener extends Listener<typeof Events.CommandAccepted> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.CommandAccepted });
	}

	public async run(payload: CommandAcceptedPayload) {
    const { client } = this.container;
		const { message, command, parameters, context } = payload;
		const args = await command.preParse(message, parameters, context);
		const result = await fromAsync(async () => {
			client.emit(Events.CommandRun, message, command, { ...payload, args });
			const result = await command.messageRun(message, args, context);
			client.emit(Events.CommandSuccess, { ...payload, args, result });
		});

		if (isErr(result)) {
			client.emit(Events.CommandError, result.error, { ...payload, args, piece: command });
		}

		client.emit(Events.CommandFinish, message, command, { ...payload, args });
	}
}
