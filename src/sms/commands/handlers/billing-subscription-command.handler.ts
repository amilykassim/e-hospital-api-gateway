import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { BillingSubscriptionEvent } from '../../events/implementation';
import { BillingSubscriptionCommand} from '../implementation';

@CommandHandler(BillingSubscriptionCommand)
export class BillingSubscriptionCommandHandler implements ICommandHandler<BillingSubscriptionCommand> {
  constructor(
    private readonly eventBus: EventBus,
  ) { }

  async execute(command: BillingSubscriptionCommand) {
    const { billSubscription } = command;
    this.eventBus.publish(new BillingSubscriptionEvent(billSubscription));

    return { isPublished: true }; // used for unit tests
  }
}
