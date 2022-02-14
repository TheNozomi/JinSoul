import { Listener } from '../lib/structures';
import { Events } from '../lib/types';
import qrcode from 'qrcode-terminal';

export class QRListener extends Listener<typeof Events.QR> {
  public constructor(context: Listener.Context) {
    super(context, { event: Events.QR });
  }

  public run(qr: string) {
    qrcode.generate(qr, { small: true });
  }
}
