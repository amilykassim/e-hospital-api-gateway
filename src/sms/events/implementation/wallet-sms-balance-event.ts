import { WalletSMSBalanceRequestDto } from "src/sms/dto/wallet-sms-balance-request";

export class WalletSMSBalanceEvent {
  constructor(
    public readonly walletSMSBalance: WalletSMSBalanceRequestDto,
  ) { }
}
