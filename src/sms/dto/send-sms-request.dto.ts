import { ApiProperty } from "@nestjs/swagger";

export class SMSDto {
  @ApiProperty({ description: "The title or header of the SMS as seen by the receiver" })
  title: string;

  @ApiProperty({ description: "The content of the SMS" })
  message: string;

  @ApiProperty({ description: "The phone number's receivers of the SMS" })
  receivers: [string];

  @ApiProperty({ description: "Contact list name" })
  contactListName?: string;

  @ApiProperty({ description: "SMS callback url" })
  callbackUrl?: string;

  @ApiProperty({ description: "Cron expression time for scheduling SMS" })
  cron?: string;

  @ApiProperty({ description: "The customer ID" })
  customerId?: string;

  @ApiProperty({ description: "The status tracking ID" })
  trackId?: string;

  @ApiProperty({ description: "Metadata" })
  metadata?: Object;
}
