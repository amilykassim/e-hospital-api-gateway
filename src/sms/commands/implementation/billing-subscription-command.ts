import { BillingSubscriptionRequestDto } from "src/sms/dto/billing-subscription-request.dto";

export class BillingSubscriptionCommand {
  constructor(
    public readonly billSubscription: BillingSubscriptionRequestDto
  ) { }
}