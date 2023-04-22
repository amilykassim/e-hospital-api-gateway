import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { BillingSubscriptionRepository } from '../../repository/billing-subscription.repository';
import { BillingSubscriptionEvent } from '../implementation';

@EventsHandler(BillingSubscriptionEvent)
export class BillingSubscriptionEventHandler implements IEventHandler<BillingSubscriptionEvent> {
  constructor(private repository: BillingSubscriptionRepository) { }

  handle(event: BillingSubscriptionEvent) {
    const { billSubscription } = event;
    return this.repository.billSubscriptionRequest(billSubscription);
  }
}
