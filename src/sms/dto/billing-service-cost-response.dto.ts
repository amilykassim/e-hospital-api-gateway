import { ApiProperty } from "@nestjs/swagger";

export class BillingServiceCostResponseDto {
  @ApiProperty({ description: "Amount to pay or charge the user" })
  result: number;

  @ApiProperty({ description: "The product name ex: SMS" })
  productName: string;

  @ApiProperty({ description: "Transaction identifier" })
  transactionId: string;
}