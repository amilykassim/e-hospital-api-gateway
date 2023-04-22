import { ApiProperty } from "@nestjs/swagger";

export class SMSDeductionResponseDto {
  @ApiProperty({ description: "The transaction id, PS: should be a valid UUID" })
  transactionId: string;

  @ApiProperty({ description: "SUCCESS | FAILED" })
  status: string;

  @ApiProperty({ description: "description" })
  description: string;

  @ApiProperty({ description: "sms balance" })
  smsBalance: string;

  @ApiProperty({ description: "number of sms deducted" })
  smsDeducted: string;
}
