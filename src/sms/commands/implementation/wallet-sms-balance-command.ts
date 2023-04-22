import { WalletSMSBalanceRequestDto } from "src/sms/dto/wallet-sms-balance-request";

export class WalletSMSBalanceCommand {
  constructor(
    public readonly walletSMSBalance: WalletSMSBalanceRequestDto
  ) { }
}