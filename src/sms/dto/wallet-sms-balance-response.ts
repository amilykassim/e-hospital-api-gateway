import { ApiProperty } from "@nestjs/swagger";

export class WalletSMSBalanceResponseDto {
  @ApiProperty({ description: "Transaction id, should be a valid UUID" })
  transactionId: string;

  @ApiProperty({ description: "Remaining balance" })
  balance: number;
}
