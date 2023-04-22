import { WalletCreationRequestDto } from "src/sms/dto/wallet-creation-request.dto";

export class WalletCreationEvent {
  constructor(
    public readonly wallet: WalletCreationRequestDto,
  ) { }
}