import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { BillingServiceCostEvent } from '../../events/implementation';
import { BillingServiceCostCommand } from '../implementation';

@CommandHandler(BillingServiceCostCommand)
export class BillingServiceCostCommandHandler implements ICommandHandler<BillingServiceCostCommand> {
  constructor(
    private readonly eventBus: EventBus,
  ) { }

  async execute(command: BillingServiceCostCommand) {
    const { billServiceCost } = command;
    this.eventBus.publish(new BillingServiceCostEvent(billServiceCost));

    return { isPublished: true }; // used for unit tests
  }
}
