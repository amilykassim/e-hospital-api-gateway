import { Injectable } from '@nestjs/common';
import { BillingSubscriptionRequestDto } from '../dto/billing-subscription-request.dto';
import { AppLogs } from '../logger/app.logs';
import { KafkaHelper } from '../utils/kafka-helper';
require('dotenv').config(); // setup the necessary kafka configs

@Injectable()
export class BillingSubscriptionRepository {
  constructor(
    private readonly kafkaHelper: KafkaHelper
  ) {}
  async billSubscriptionRequest(billSubscription: BillingSubscriptionRequestDto) {
    // send to kafka
    return this.kafkaHelper.send(billSubscription['trackId'], billSubscription, 'billSubscriptionRequest', process.env.BILLING_SUBSCRIPTION_REQUEST_TOPIC);
  }
}
