import { ApiProperty } from "@nestjs/swagger";

export class SMSAllocationRequestDto {
  @ApiProperty({ description: "The customer ID" })
  merchantId: string;

  @ApiProperty({ description: "The amount of SMS to be allocated" })
  amount: number;

  @ApiProperty({ description: "A descriptive message" })
  description: string;

  @ApiProperty({ description: "The transaction id, PS: should be a valid UUID" })
  transactionId: string;
}
