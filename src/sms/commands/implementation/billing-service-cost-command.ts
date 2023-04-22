import { BillingServiceCostRequestDto } from "src/sms/dto/billing-service-cost-request.dto";

export class BillingServiceCostCommand {
  constructor(
    public readonly billServiceCost: BillingServiceCostRequestDto
  ) { }
}
