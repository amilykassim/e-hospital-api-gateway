import { ApiProperty } from "@nestjs/swagger";

export class AdminSMSAllocationRequestDto {
  @ApiProperty({ description: "The customer ID" })
  merchantId: string;

  @ApiProperty({ description: "The amount of SMS to be allocated" })
  numberOfSMS: number;

  @ApiProperty({ description: "The amount of cash paid" })
  amountPaid: number;

  @ApiProperty({ description: "email" })
  email: string;
}
