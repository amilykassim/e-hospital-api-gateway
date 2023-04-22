import { BillingServiceCostRequestDto } from "src/sms/dto/billing-service-cost-request.dto";

export class BillingServiceCostEvent {
  constructor(
    public readonly billServiceCost: BillingServiceCostRequestDto,
  ) { }
}
