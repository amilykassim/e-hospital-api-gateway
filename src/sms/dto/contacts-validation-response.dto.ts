import { ApiProperty } from "@nestjs/swagger";
import { PhoneNumberDTO } from "./phone-number.dto";

export class ContactsResponseDTO {
  @ApiProperty({ description: "Group name" })
  statusCode: number;

  @ApiProperty({ description: "message" })
  message?: string;

  @ApiProperty({ description: "returned data" })
  data?: [object];

  @ApiProperty({ description: "errors" })
  error?: string;

  @ApiProperty({ description: "The customer ID" })
  customerId?: string;

  @ApiProperty({ description: "The status tracking ID" })
  trackId?: string;

  @ApiProperty({ description: "Metadata" })
  metadata?: Object;
}
