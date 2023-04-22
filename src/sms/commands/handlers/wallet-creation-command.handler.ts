import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { SendSmsEvent, WalletCreationEvent } from '../../events/implementation';
import { WalletCreationCommand } from '../implementation';

@CommandHandler(WalletCreationCommand)
export class WalletCreationCommandHandler implements ICommandHandler<WalletCreationCommand> {
  constructor(
    private readonly eventBus: EventBus,
  ) { }

  async execute(command: WalletCreationCommand) {
    const { wallet } = command;
    this.eventBus.publish(new WalletCreationEvent(wallet));

    return { isPublished: true }; // used for unit tests
  }
}
