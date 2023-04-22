import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { WalletSMSBalanceEvent } from '../../events/implementation';
import { WalletSMSBalanceCommand } from '../implementation';

@CommandHandler(WalletSMSBalanceCommand)
export class WalletSMSBalanceCommandHandler implements ICommandHandler<WalletSMSBalanceCommand> {
  constructor(
    private readonly eventBus: EventBus,
  ) { }

  async execute(command: WalletSMSBalanceCommand) {
    const { walletSMSBalance } = command;
    this.eventBus.publish(new WalletSMSBalanceEvent(walletSMSBalance));

    return { isPublished: true }; // used for unit tests
  }
}
