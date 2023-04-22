import { ApiProperty } from "@nestjs/swagger";

export class SMSResponseDto {
  @ApiProperty({ description: "Request trackId" })
  trackId: string;

  @ApiProperty({ description: "The title or header of the SMS as seen by the receiver" })
  statusCode: string;

  @ApiProperty({ description: "The content of the SMS" })
  message: string;

  @ApiProperty({ description: "The customer ID" })
  customerId: string;

  @ApiProperty({ description: "Timestamp" })
  metadata?: Object;
}
