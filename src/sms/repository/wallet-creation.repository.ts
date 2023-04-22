import { Injectable } from '@nestjs/common';
import { WalletCreationRequestDto } from '../dto/wallet-creation-request.dto';
import { KafkaHelper } from '../utils/kafka-helper';
require('dotenv').config(); // setup the necessary kafka configs

@Injectable()
export class WalletCreationRepository {
  constructor(
    private readonly kafkaHelper: KafkaHelper
  ) {}
  async createWallet(wallet: WalletCreationRequestDto) {
    // send to kafka
    wallet['isCreateWallet'] = true;
    this.kafkaHelper.send(wallet['trackId'], wallet, 'createWallet', process.env.WALLET_CREATE_REQUEST_TOPIC);
  }
}
