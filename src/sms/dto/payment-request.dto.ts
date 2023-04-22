import { ApiProperty } from "@nestjs/swagger";

export class PaymentRequestDto {
  @ApiProperty({ description: "Payer Telephone Number" })
  telephoneNumber: string;

  @ApiProperty({ description: "Amount to be paid" })
  amount: number;

  @ApiProperty({ description: "The customer ID" })
  organizationId: string;

  @ApiProperty({ description: "Payment request description message" })
  description: string;

  @ApiProperty({ description: "Payment completed callback endpoint or url" })
  callbackUrl: string;

  @ApiProperty({ description: "Transaction id, should be a valid UUID" })
  transactionId: string;
}
