import { ApiProperty } from "@nestjs/swagger";

export class BillingServiceCostRequestDto {
  @ApiProperty({ description: "The customer ID" })
  merchantId: string;

  @ApiProperty({ description: "The product name ex: SMS" })
  productName: string;

  @ApiProperty({ description: "Paid | Payable amount" })
  amount: number;

  @ApiProperty({ description: "Transaction identifier" })
  transactionId: string;
}