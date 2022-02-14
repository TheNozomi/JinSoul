import type {
  ArgumentStore,
  CommandStore,
  ListenerStore,
  PreconditionStore
} from '../structures/stores';

declare module '@sapphire/pieces' {
  interface StoreRegistryEntries {
    arguments: ArgumentStore;
    commands: CommandStore;
    listeners: ListenerStore;
    preconditions: PreconditionStore;
  }
}

export * from './Events';
