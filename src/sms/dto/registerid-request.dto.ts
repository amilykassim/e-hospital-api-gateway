import { ApiProperty } from "@nestjs/swagger";

export class RegisterIDRequestDTO {
  @ApiProperty({ description: "title" })
  title: string;

  @ApiProperty({ description: "The customer ID" })
  customerId: string;

  @ApiProperty({ description: "The customer ID" })
  customerName: string;

  @ApiProperty({ description: "The customer ID" })
  email: string;

  @ApiProperty({ description: "The sms type" })
  smsType: string;

  @ApiProperty({ description: "The status tracking ID" })
  trackId: string;

  @ApiProperty({ description: "Metadata" })
  metadata?: Object;
}
