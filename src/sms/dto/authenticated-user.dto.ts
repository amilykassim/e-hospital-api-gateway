import { ApiProperty } from "@nestjs/swagger";

export class AuthenticatedUserDto {
  @ApiProperty({ description: "The merchantId when a user token is sent is under the <sub> field" })
  sub: string;

  @ApiProperty({ description: "The merchantId when a machine token is sent is under the <customer_id> field" })
  customer_id: string;

  @ApiProperty({ description: "Username" })
  name: string;

  @ApiProperty({ description: "Email" })
  email: string;

  @ApiProperty({ description: "Email verification" })
  email_verified: string;

  @ApiProperty({ description: "Telephone number" })
  phone_number: string;
  
  @ApiProperty({ description: "SMS callback url" })
  callbackUrl: string;

  resource_access?: string;
}