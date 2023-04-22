import { Injectable } from '@nestjs/common';
import { WalletSMSBalanceRequestDto } from '../dto/wallet-sms-balance-request';
import { KafkaHelper } from '../utils/kafka-helper';
require('dotenv').config(); // setup the necessary kafka configs

@Injectable()
export class WalletSMSBalanceRepository {
  constructor(
    private readonly kafkaHelper: KafkaHelper
  ) {}
  async checkWalletSMSBalance(walletSMSBalance: WalletSMSBalanceRequestDto) {
    // send to kafka
    this.kafkaHelper.send(walletSMSBalance['trackId'], walletSMSBalance, 'checkWalletSMSBalance', process.env.WALLET_SMS_BALANCE_REQUEST_TOPIC);
  }
}
