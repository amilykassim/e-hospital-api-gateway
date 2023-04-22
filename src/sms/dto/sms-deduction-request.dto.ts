import { ApiProperty } from "@nestjs/swagger";

export class SMSDeductionRequestDto {
  @ApiProperty({ description: "The customer ID" })
  merchantId: string;

  @ApiProperty({ description: "The amount of SMS to be deducted" })
  amount: number;

  @ApiProperty({ description: "Transaction id, should be a valid UUID" })
  transactionId: string;
}
