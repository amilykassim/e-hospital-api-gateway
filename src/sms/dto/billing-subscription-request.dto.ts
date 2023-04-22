import { ApiProperty } from "@nestjs/swagger";

export class BillingSubscriptionRequestDto {
  @ApiProperty({ description: "The product name ex: SMS" })
  productName: string;

  @ApiProperty({ description: "The customer ID" })
  merchantId: string;
  computation?: string;
  chargeValue?: number;
  trackId?: string;
}
