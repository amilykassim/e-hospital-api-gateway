import { ApiProperty } from "@nestjs/swagger";

export class WalletSMSBalanceRequestDto {
  @ApiProperty({ description: "The customer ID" })
  merchantId: string;

  @ApiProperty({ description: "Transaction id, should be a valid UUID" })
  transactionId: string;
}
