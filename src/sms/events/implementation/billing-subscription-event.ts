import { BillingSubscriptionRequestDto } from "src/sms/dto/billing-subscription-request.dto";

export class BillingSubscriptionEvent {
  constructor(
    public readonly billSubscription: BillingSubscriptionRequestDto,
  ) { }
}
