import { container, StoreRegistry } from '@sapphire/pieces';
import { Client, type ClientOptions } from 'whatsapp-web.js';
import { ListenerStore } from './structures/stores/ListenerStore';
import { join } from 'path';

export type JinSoulClientOptions = ClientOptions

export class JinSoulClient extends Client {

  public stores: StoreRegistry;

  constructor(options: JinSoulClientOptions) {
    super(options);

    container.client = this;

    this.stores = new StoreRegistry();
    container.stores = this.stores;

    this.stores
      .register(new ListenerStore().registerPath(join(__dirname, '..', 'listeners')));

  }

  public async login() {
    // @ts-expect-error
    await Promise.all([ ...this.stores.values() ].map(store => store.loadAll()));

    return super.initialize();
  }

}

declare module '@sapphire/pieces' {
	interface Container {
    client: JinSoulClient;
  }
}
