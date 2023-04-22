import { ApiProperty } from "@nestjs/swagger";

export class BillingSubscriptionResponseDto {
  @ApiProperty({ description: "Success description" })
  msg: string;

  @ApiProperty({ description: "Error description" })
  error: string;
}