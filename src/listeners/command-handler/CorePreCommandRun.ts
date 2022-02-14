import type { PieceContext } from '@sapphire/pieces';
import { Listener } from '../../lib/structures/Listener';
import { Events, PreCommandRunPayload } from '../../lib/types/Events';

export class CoreListener extends Listener<typeof Events.PreCommandRun> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.PreCommandRun });
	}

	public async run(payload: PreCommandRunPayload) {
    const { client } = this.container;
		const { message, command } = payload;

		// Run global preconditions:
		const globalResult = await this.container.stores.get('preconditions').run(message, command, payload as any);
		if (!globalResult.success) {
			client.emit(Events.CommandDenied, globalResult.error, payload);
			return;
		}

		// Run command-specific preconditions:
		const localResult = await command.preconditions.run(message, command, payload as any);
		if (!localResult.success) {
			client.emit(Events.CommandDenied, localResult.error, payload);
			return;
		}

		client.emit(Events.CommandAccepted, payload);
	}
}
