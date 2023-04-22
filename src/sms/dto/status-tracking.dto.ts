import { ApiProperty } from "@nestjs/swagger";

export class StatusTrackingDto {
  @ApiProperty({ description: "The track ID" })
  trackId: string;

  @ApiProperty({ description: "The customer ID" })
  merchantId: string;

  @ApiProperty({ description: "Message" })
  message: string;

  @ApiProperty({ description: "Timestamp" })
  timestamp: any;

  @ApiProperty({ description: "Metadata" })
  metadata?: Object;
}