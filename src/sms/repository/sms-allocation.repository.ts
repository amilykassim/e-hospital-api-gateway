import { Injectable } from '@nestjs/common';
import { SMSAllocationRequestDto } from '../dto/sms-allocation-request.dto';
import { KafkaHelper } from '../utils/kafka-helper';
require('dotenv').config(); // setup the necessary kafka configs

@Injectable()
export class SMSAllocationRepository {
  constructor(
    private readonly kafkaHelper: KafkaHelper
  ) {}
  async allocateSMS(smsAllocation: SMSAllocationRequestDto) {
    // send to kafka
    this.kafkaHelper.send(smsAllocation['trackId'], smsAllocation, 'allocateSMS', process.env.WALLET_SMS_ALLOCATE_REQUEST_TOPIC);
  }
}
