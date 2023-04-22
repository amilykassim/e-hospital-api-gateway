import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { WalletSMSBalanceRepository } from '../../repository/wallet-sms-balance.repository';
import { WalletSMSBalanceEvent } from '../implementation';

@EventsHandler(WalletSMSBalanceEvent)
export class WalletSMSBalanceEventHandler implements IEventHandler<WalletSMSBalanceEvent> {
  constructor(private repository: WalletSMSBalanceRepository) { }

  handle(event: WalletSMSBalanceEvent) {
    const { walletSMSBalance } = event;
    return this.repository.checkWalletSMSBalance(walletSMSBalance);
  }
}
