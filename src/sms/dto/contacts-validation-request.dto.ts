import { ApiProperty } from "@nestjs/swagger";
import { PhoneNumberDTO } from "./phone-number.dto";

export class ContactsRequestDTO {
  @ApiProperty({ description: "Group name" })
  groupName: string;

  @ApiProperty({ description: "Array of contacts" })
  contacts: [PhoneNumberDTO];

  @ApiProperty({ description: "The customer ID" })
  customerId?: string;

  @ApiProperty({ description: "The status tracking ID" })
  trackId?: string;

  @ApiProperty({ description: "Metadata" })
  metadata?: Object;
}
