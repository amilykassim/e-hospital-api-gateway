import { Injectable } from '@nestjs/common';
import { SMSDeductionRequestDto } from '../dto/sms-deduction-request.dto';
import { AppLogs } from '../logger/app.logs';
import { KafkaHelper } from '../utils/kafka-helper';
require('dotenv').config(); // setup the necessary kafka configs

@Injectable()
export class SMSDeductionRepository {
  constructor(
    private readonly kafkaHelper: KafkaHelper
  ) {}
  async deductSMS(smsDeduction: SMSDeductionRequestDto) {
    // send to kafka
    this.kafkaHelper.send(smsDeduction['trackId'], smsDeduction, 'deductSMS', process.env.WALLET_SMS_DEDUCT_REQUEST_TOPIC);
  }
}
