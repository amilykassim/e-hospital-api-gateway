import { ApiProperty } from "@nestjs/swagger";

export class PurchaseSMSDto {
  @ApiProperty({ description: "This is the phone number to buy SMS on" })
  telephoneNumber: string;

  @ApiProperty({ description: "Amount to pay for the SMS" })
  amount: number;

  @ApiProperty({ description: "This is the id of your company, your receive this id while registering your company on Oltranz" })
  organizationId: string;

  @ApiProperty({ description: "This is the message explaining what the SMS are bought for" })
  description: string;
}
