import { ApiProperty } from "@nestjs/swagger";

export class WalletCreationRequestDto {
  @ApiProperty({ description: "The customer ID" })
  ownerId: string;

  @ApiProperty({ description: "The customer name or business name" })
  ownerName: string;

  @ApiProperty({ description: "Type of service example: SMS" })
  type?: string;

  @ApiProperty({ description: "Email, ex: joedoe@example.com" })
  email: string;

  @ApiProperty({ description: "Phone number, ex: 2507xxxxxxxx" })
  phone: string;
}
