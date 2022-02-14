import { Piece } from '@sapphire/pieces';
import type { Awaitable } from '@sapphire/utilities';
import type { Message } from 'whatsapp-web.js';
import { PreconditionError } from '../errors/PreconditionError';
import type { UserError } from '../errors/UserError';
import { err, ok, Result } from '../parsers/Result';
import type { Command } from './Command';

export type PreconditionResult = Awaitable<Result<unknown, UserError>>;
export type AsyncPreconditionResult = Promise<Result<unknown, UserError>>;

export abstract class Precondition<O extends PreconditionOptions = PreconditionOptions> extends Piece<O> {
	public readonly position: number | null;

	public constructor(context: Piece.Context, options: Precondition.Options = {}) {
		super(context, options);
		this.position = options.position ?? null;
	}

	public abstract run(message: Message, command: Command, context: Precondition.Context): Precondition.Result;

	public ok(): Precondition.Result {
		return ok();
	}

	/**
	 * Constructs a {@link PreconditionError} with the precondition parameter set to `this`.
	 * @param options The information.
	 */
	public error(options: Omit<PreconditionError.Options, 'precondition'> = {}): Precondition.Result {
		return err(new PreconditionError({ precondition: this, ...options }));
	}
}

export interface Preconditions {
	Enabled: never;
  GroupOnly: never;
  PrivateOnly: never;
}

export type PreconditionKeys = keyof Preconditions;
export type SimplePreconditionKeys = {
	[K in PreconditionKeys]: Preconditions[K] extends never ? K : never;
}[PreconditionKeys];

export interface PreconditionOptions extends Piece.Options {
	/**
	 * The position for the precondition to be set at in the global precondition list. If set to `null`, this
	 * precondition will not be set as a global one.
	 * @default null
	 */
	position?: number | null;
}

export interface PreconditionContext extends Record<PropertyKey, unknown> {
	external?: boolean;
}

export namespace Precondition {
	export type Options = PreconditionOptions;
	export type Context = PreconditionContext;
	export type Result = PreconditionResult;
	export type AsyncResult = AsyncPreconditionResult;
}
