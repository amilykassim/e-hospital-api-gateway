import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { WalletCreationRepository } from '../../repository/wallet-creation.repository';
import { WalletCreationEvent } from '../implementation';

@EventsHandler(WalletCreationEvent)
export class WalletCreationEventHandler implements IEventHandler<WalletCreationEvent> {
  constructor(private repository: WalletCreationRepository) { }

  handle(event: WalletCreationEvent) {
    const { wallet } = event;
    return this.repository.createWallet(wallet);
  }
}
