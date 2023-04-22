import { ApiProperty } from "@nestjs/swagger";

export class WalletCreationResponseDto {
  @ApiProperty({ description: "The customer ID" })
  merchantId: string;

  @ApiProperty({ description: "SUCCESS|FAILED" })
  status: string;

  @ApiProperty({ description: "The description of the response" })
  description: string;
}
