import { WalletCreationRequestDto } from "src/sms/dto/wallet-creation-request.dto";

export class WalletCreationCommand {
  constructor(
    public readonly wallet: WalletCreationRequestDto
  ) { }
}