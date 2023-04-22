import { Injectable } from '@nestjs/common';
import { BillingServiceCostRequestDto } from '../dto/billing-service-cost-request.dto';
import { AppLogs } from '../logger/app.logs';
import { KafkaHelper } from '../utils/kafka-helper';
require('dotenv').config();

@Injectable()
export class BillingServiceCostRepository {
  constructor(
    private readonly kafkaHelper: KafkaHelper
  ) {}
  async billServiceCostRequest(billServiceCost: BillingServiceCostRequestDto) {
    // send to kafka
    this.kafkaHelper.send(billServiceCost['trackId'], billServiceCost, 'billServiceCost', process.env.BILLING_SERVICE_COST_REQUEST_TOPIC);
  }
}
