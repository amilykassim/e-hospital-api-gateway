import { ApiProperty } from "@nestjs/swagger";

export class RouteRequestDTO {
  @ApiProperty({ description: "Topic name" })
  topic?: string;

  @ApiProperty({ description: "Telco prefix" })
  telcoPrefix?: string;

  @ApiProperty({ description: "Phone number length" })
  phoneNumberLength?: number;

  @ApiProperty({ description: "title" })
  title?: [string];

  @ApiProperty({ description: "The customer ID" })
  customerId?: string;

  @ApiProperty({ description: "The status tracking ID" })
  trackId?: string;

  @ApiProperty({ description: "Metadata" })
  metadata?: Object;
}
