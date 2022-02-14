import { AliasPiece, AliasPieceJSON, PieceContext } from '@sapphire/pieces';
import { Awaitable, isNullish } from '@sapphire/utilities';
import { Message } from 'whatsapp-web.js';
import * as Lexure from 'lexure';
import { Args } from '../parsers/Args';
import { PreconditionContainerArray, PreconditionEntryResolvable } from '../utils/preconditions/PreconditionContainerArray';
import { FlagStrategyOptions, FlagUnorderedStrategy } from '../utils/strategies/FlagUnorderedStrategy';

export abstract class Command<T = Args, O extends Command.Options = Command.Options> extends AliasPiece<O> {
	/**
	 * A basic summary about the command
	 * @since 1.0.0
	 */
	public description: string;

	/**
	 * The preconditions to be run.
	 * @since 1.0.0
	 */
	public preconditions: PreconditionContainerArray;

	/**
	 * Longer version of command's summary and how to use it
	 * @since 1.0.0
	 */
	public detailedDescription: string;

	/**
	 * The full category for the command. Either an array of strings that denote every (sub)folder the command is in,
	 * or `null` if it could not be resolved automatically.
	 *
	 * If this is `null` for how you setup your code then you can overwrite how the `fullCategory` is resolved by
	 * extending this class and overwriting the assignment in the constructor.
	 * @since 2.0.0
	 */
	public readonly fullCategory: readonly string[];

	/**
	 * The strategy to use for the lexer.
	 * @since 1.0.0
	 */
	public strategy: Lexure.UnorderedStrategy;

	/**
	 * If {@link JinSoulClient.typing} is true, it can be overridden for a specific command using this property, set via its options.
	 * Otherwise, this property will be ignored.
	 * @default true
	 */
	public typing: boolean;

	/**
	 * The lexer to be used for command parsing
	 * @since 1.0.0
	 * @private
	 */
	protected lexer = new Lexure.Lexer();

	/**
	 * @since 1.0.0
	 * @param context The context.
	 * @param options Optional Command settings.
	 */
	protected constructor(context: PieceContext, options: Command.Options = {}) {
		super(context, { ...options, name: (options.name ?? context.name).toLowerCase() });
		this.description = options.description ?? '';
		this.detailedDescription = options.detailedDescription ?? '';
		this.strategy = new FlagUnorderedStrategy(options);
		this.fullCategory = options.fullCategory ?? this.location.directories;
		this.typing = options.typing ?? true;

		this.lexer.setQuotes(
			options.quotes ?? [
				['"', '"'], // Double quotes
				['“', '”'], // Fancy quotes (on iOS)
				['「', '」'] // Corner brackets (CJK)
			]
		);

		if (options.generateDashLessAliases) {
			const dashLessAliases = [];
			if (this.name.includes('-')) dashLessAliases.push(this.name.replace(/-/g, ''));
			for (const alias of this.aliases) if (alias.includes('-')) dashLessAliases.push(alias.replace(/-/g, ''));

			this.aliases = [...this.aliases, ...dashLessAliases];
		}

		this.preconditions = new PreconditionContainerArray(options.preconditions);
		this.parseConstructorPreConditions(options);

		const run = Reflect.get(this, 'run');
		if (typeof run === 'function' && !Reflect.has(this, 'messageRun')) {
			process.emitWarning('The "run" method in commands is deprecated.', {
				type: 'DeprecationWarning',
				code: 'CHAT_INPUT_COMMAND_MIGRATION_PREPARATION',
				detail: `Use "messageRun" instead (seen in "${this.name}", at "${this.location.full}")`
			});
			Reflect.set(this, 'messageRun', run);
		}
	}

	/**
	 * The pre-parse method. This method can be overridden by plugins to define their own argument parser.
	 * @param message The message that triggered the command.
	 * @param parameters The raw parameters as a single string.
	 * @param context The command-context used in this execution.
	 */
	public preParse(message: Message, parameters: string, context: Command.RunContext): Awaitable<T> {
		const parser = new Lexure.Parser(this.lexer.setInput(parameters).lex()).setUnorderedStrategy(this.strategy);
		const args = new Lexure.Args(parser.parse());
		return new Args(message, this as any, args, context) as any;
	}

	/**
	 * The main category for the command, if any.
	 *
	 * This getter retrieves the first value of {@link Command.fullCategory}, if it has at least one item, otherwise it
	 * returns `null`.
	 *
	 * @note You can set {@link Command.Options.fullCategory} to override the built-in category resolution.
	 */
	public get category(): string | null {
		return this.fullCategory.length > 0 ? this.fullCategory[0] as string : null;
	}

	/**
	 * The sub-category for the command, if any.
	 *
	 * This getter retrieves the second value of {@link Command.fullCategory}, if it has at least two items, otherwise
	 * it returns `null`.
	 *
	 * @note You can set {@link Command.Options.fullCategory} to override the built-in category resolution.
	 */
	public get subCategory(): string | null {
		return this.fullCategory.length > 1 ? this.fullCategory[1] as string : null;
	}

	/**
	 * The parent category for the command.
	 *
	 * This getter retrieves the last value of {@link Command.fullCategory}, if it has at least one item, otherwise it
	 * returns `null`.
	 *
	 * @note You can set {@link Command.Options.fullCategory} to override the built-in category resolution.
	 */
	public get parentCategory(): string | null {
		return this.fullCategory.length > 1 ? this.fullCategory[this.fullCategory.length - 1] as string : null;
	}

	/**
	 * Executes the command's logic for a message.
	 * @param message The message that triggered the command.
	 * @param args The value returned by {@link Command.preParse}, by default an instance of {@link Args}.
	 */
	public abstract messageRun(message: Message, args: T, context: Command.RunContext): Awaitable<unknown>;

	/**
	 * Defines the JSON.stringify behavior of the command.
	 */
	public override toJSON(): CommandJSON {
		return {
			...super.toJSON(),
			description: this.description,
			detailedDescription: this.detailedDescription,
			category: this.category
		};
	}

	/**
	 * Parses the command's options and processes them
	 * @since 2.0.0
	 * @param options The command options given from the constructor.
	 */
	protected parseConstructorPreConditions(options: Command.Options): void {
		this.parseConstructorPreConditionsRunIn(options);

	}

	/**
	 * Appends the `GroupChatOnly` and `PrivateChatOnly` preconditions based on the values passed in
	 * {@link Command.Options.runIn}, defaulting to `null`, which doesn't add a precondition.
	 * @param options The command options given from the constructor.
	 */
	protected parseConstructorPreConditionsRunIn(options: Command.Options) {
		const runIn = this.resolveConstructorPreConditionsRunType(options.runIn);
		if (runIn !== null) this.preconditions.append(runIn as any);
	}

	private resolveConstructorPreConditionsRunType(runIn: Command.Options['runIn']): PreconditionContainerArray | CommandPreConditions | null {
		if (isNullish(runIn)) return null;
		if (typeof runIn === 'string') {
			switch (runIn) {
        case 'PRIVATE_CHAT':
          return CommandPreConditions.GroupChatOnly
        case 'GROUP_CHAT':
          return CommandPreConditions.GroupChatOnly
				default:
					return null;
			}
		}

		// If there's no channel it can run on, throw an error:
		if (runIn.length === 0) {
			throw new Error(`${this.constructor.name}[${this.name}]: "runIn" was specified as an empty array.`);
		}

		if (runIn.length === 1) {
			return this.resolveConstructorPreConditionsRunType(runIn[0]);
		}

		const keys = new Set(runIn);

    const privateChat = keys.has('PRIVATE_CHAT');
    const groupChat = keys.has('GROUP_CHAT');

		// If runs everywhere, optimise to null:
		if (privateChat && groupChat) return null;

		const preconditions = new PreconditionContainerArray();
    // @ts-ignore
		if (privateChat) preconditions.append(CommandPreConditions.PrivateChatOnly);
    // @ts-ignore
    if (groupChat) preconditions.append(CommandPreConditions.GroupChatOnly);

		return preconditions;
	}
}

export interface Command<T = Args> {
	/**
	 * Executes the command's logic.
	 * @param message The message that triggered the command.
	 * @param args The value returned by {@link Command.preParse}, by default an instance of {@link Args}.
	 * @deprecated Use `messageRun` instead.
	 */
	run?(message: Message, args: T, context: Command.RunContext): Awaitable<unknown>;
}

/**
 * The allowed values for {@link Command.Options.runIn}.
 * @remark It is discouraged to use this type, we recommend using {@link Command.OptionsRunTypeEnum} instead.
 * @since 2.0.0
 */
export type CommandOptionsRunType =
	| 'GROUP_CHAT'
  | 'PRIVATE_CHAT'

/**
 * The allowed values for {@link Command.Options.runIn} as an enum.
 * @since 2.0.0
 */
export const enum CommandOptionsRunTypeEnum {
	GroupChat = 'GROUP_CHAT',
  PrivateChat = 'PRIVATE_CHAT'
}

/**
 * The available command pre-conditions.
 * @since 2.0.0
 */
export const enum CommandPreConditions {
  GroupChatOnly = 'GroupChatOnly',
  PrivateChatOnly = 'PrivateChatOnly'
}

/**
 * The {@link Command} options.
 * @since 1.0.0
 */
export interface CommandOptions extends AliasPiece.Options, FlagStrategyOptions {
	/**
	 * Whether to add aliases for commands with dashes in them
	 * @since 1.0.0
	 * @default false
	 */
	generateDashLessAliases?: boolean;

	/**
	 * The description for the command.
	 * @since 1.0.0
	 * @default ''
	 */
	description?: string;

	/**
	 * The detailed description for the command.
	 * @since 1.0.0
	 * @default ''
	 */
	detailedDescription?: string;

	/**
	 * The full category path for the command
	 * @since 2.0.0
	 * @default 'An array of folder names that lead back to the folder that is registered for in the commands store'
	 * @example
	 * ```typescript
	 * // Given a file named `ping.js` at the path of `commands/General/ping.js`
	 * ['General']
	 *
	 * // Given a file named `info.js` at the path of `commands/General/About/ping.js`
	 * ['General', 'About']
	 * ```
	 */
	fullCategory?: string[];

	/**
	 * The {@link Precondition}s to be run, accepts an array of their names.
	 * @seealso {@link PreconditionContainerArray}
	 * @since 1.0.0
	 * @default []
	 */
	preconditions?: readonly PreconditionEntryResolvable[];

	/**
	 * The quotes accepted by this command, pass `[]` to disable them.
	 * @since 1.0.0
	 * @default
	 * [
	 *   ['"', '"'], // Double quotes
	 *   ['“', '”'], // Fancy quotes (on iOS)
	 *   ['「', '」'] // Corner brackets (CJK)
	 * ]
	 */
	quotes?: [string, string][];

	/**
	 * The channels the command should run in. If set to `null`, no precondition entry will be added. Some optimizations are applied when given an array to reduce the amount of preconditions run (e.g. `'GUILD_TEXT'` and `'GUILD_NEWS'` becomes `'GUILD_ANY'`, and if both `'DM'` and `'GUILD_ANY'` are defined, then no precondition entry is added as it runs in all channels).
	 * @since 2.0.0
	 * @default null
	 */
	runIn?: Command.RunInTypes | CommandOptionsRunTypeEnum | readonly (Command.RunInTypes | CommandOptionsRunTypeEnum)[] | null;

	/**
	 * If {@link JinSoulClient.typing} is true, this option will override it.
	 * Otherwise, this option has no effect - you may call {@link Channel#sendTyping}` in the run method if you want specific commands to display the typing status.
	 * @default true
	 */
	typing?: boolean;
}

export interface CommandContext extends Record<PropertyKey, unknown> {
	/**
	 * The prefix used to run this command.
	 *
	 * This is a string for the mention and default prefix, and a RegExp for the `regexPrefix`.
	 */
	prefix: string | RegExp;
	/**
	 * The alias used to run this command.
	 */
	commandName: string;
	/**
	 * The matched prefix, this will always be the same as {@link Command.RunContext.prefix} if it was a string, otherwise it is
	 * the result of doing `prefix.exec(content)[0]`.
	 */
	commandPrefix: string;
}

export interface CommandJSON extends AliasPieceJSON {
	description: string;
	detailedDescription: string;
	category: string | null;
}

export namespace Command {
	export type Options = CommandOptions;
	export type JSON = CommandJSON;
	export type Context = AliasPiece.Context;
	export type RunContext = CommandContext;
	export type RunInTypes = CommandOptionsRunType;
}
