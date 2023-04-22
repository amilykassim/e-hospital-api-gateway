import { ApiProperty } from "@nestjs/swagger";

export class CheckMyWalletSMSBalanceRequest {
  @ApiProperty({ description: "The customer ID" })
  merchantId: string;

  @ApiProperty({ description: "Transaction id, should be a valid UUID" })
  transactionId: string;

  @ApiProperty({ description: "This field is for instructing to only check the wallet sms balance" })
  onlyCheckSMSWalletBalance: boolean;
}
