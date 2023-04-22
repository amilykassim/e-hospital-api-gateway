import { ApiProperty } from "@nestjs/swagger";

export class PhoneNumberDTO {
  @ApiProperty({ description: "Phone number" })
  phoneNumber: string;
}
