import { container, StoreRegistry } from '@sapphire/pieces';
import type { Awaitable } from '@sapphire/utilities';
import {
  Client,
  type ClientOptions,
  type ContactId,
  type Message
} from 'whatsapp-web.js';
import { join } from 'path';

import { ArgumentStore } from './structures/stores/ArgumentStore';
import { CommandStore } from './structures/stores/CommandStore';
import { ListenerStore } from './structures/stores/ListenerStore';
import { PreconditionStore } from './structures/stores/PreconditionStore';


export type Prefix = string | string[];

export interface PrefixHook {
  (message: Message): Awaitable<Prefix>;
}
export interface JinSoulClientOptions extends ClientOptions {
  /**
   * Whether commands can be case insensitive
   * @since 1.0.0
   * @default false
   */
  caseInsensitiveCommands?: boolean | null;

  /**
   * Whether prefixes can be case insensitive
   * @since 1.0.0
   * @default false
   */
  caseInsensitivePrefixes?: boolean | null;

  /**
   * The default prefix, in case of `null`, only mention prefix will trigger the bot's commands.
   * @since 1.0.0
   * @default null
   */
  defaultPrefix: Prefix;

  /**
   * The regex prefix, an alternative to a mention or regular prefix to allow creating natural language command messages
   * @since 1.0.0
   * @example
   * ```typescript
   * /^(hey +)?bot[,! ]/i
   *
   * // Matches:
   * // - hey bot,
   * // - hey bot!
   * // - hey bot
   * // - bot,
   * // - bot!
   * // - bot
   * ```
   */
  regexPrefix?: RegExp;

  /**
   * The prefix hook, by default it is a callback function that returns {@link JinSoulClientOptions.defaultPrefix}.
   * @since 1.0.0
   * @default () => client.options.defaultPrefix
   */
  fetchPrefix?: PrefixHook;

  /**
   * Controls whether the bot will automatically appear to be typing when a command is accepted.
   * @default false
   */
  typing?: boolean;

  /**
   * The client's ID, this is automatically set by the Ready event.
   * @since 1.0.0
   * @default this.client.info?.wid ?? null
   */
  id?: ContactId
}

export class JinSoulClient extends Client {
  public id: ContactId | null = null;

  /**
   * The method to be overriden by the developer.
   * @since 1.0.0
   * @return A string for a single prefix, an array of strings for matching multiple, or null for no match (mention prefix only).
   * @example
   * ```typescript
   * // Return always the same prefix (unconfigurable):
   * client.fetchPrefix = () => '!';
   * ```
   * @example
   * ```typescript
   * // Retrieving the prefix from a SQL database:
   * client.fetchPrefix = async (message) => {
   *   // note: driver is something generic and depends on how you connect to your database
   *   const guild = await driver.getOne('SELECT prefix FROM public.guild WHERE id = $1', [message.guild.id]);
   *   return guild?.prefix ?? '!';
   * };
   * ```
   * @example
   * ```typescript
   * // Retrieving the prefix from an ORM:
   * client.fetchPrefix = async (message) => {
   *   // note: driver is something generic and depends on how you connect to your database
   *   const guild = await driver.getRepository(GuildEntity).findOne({ id: message.guild.id });
   *   return guild?.prefix ?? '!';
   * };
   * ```
   */
  public fetchPrefix: PrefixHook = () => '!';

  public options: JinSoulClientOptions;
  public stores: StoreRegistry;

  constructor(options: JinSoulClientOptions) {
    super(options);

    container.client = this;

    this.options = options;

    this.stores = new StoreRegistry();
    container.stores = this.stores;

    this.stores
      .register(new ArgumentStore().registerPath(join(__dirname, '..', 'arguments')))
      .register(new CommandStore().registerPath(join(__dirname, '..', 'commands')))
      .register(new ListenerStore().registerPath(join(__dirname, '..', 'listeners')))
      .register(new PreconditionStore().registerPath(join(__dirname, '..', 'preconditions')));
  }

  public async login() {
    await Promise.all([...this.stores.values()].map(store => store.loadAll()));

    return super.initialize();
  }

}

declare module '@sapphire/pieces' {
  interface Container {
    client: JinSoulClient;
  }
}
