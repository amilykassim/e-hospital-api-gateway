import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { BillingServiceCostRepository } from '../../repository/billing-service-cost.repository';
import { BillingServiceCostEvent } from '../implementation';

@EventsHandler(BillingServiceCostEvent)
export class BillingServiceCostEventHandler implements IEventHandler<BillingServiceCostEvent> {
  constructor(private repository: BillingServiceCostRepository) { }

  handle(event: BillingServiceCostEvent) {
    const { billServiceCost } = event;
    return this.repository.billServiceCostRequest(billServiceCost);
  }
}
