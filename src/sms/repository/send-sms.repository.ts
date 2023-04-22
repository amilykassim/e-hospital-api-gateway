import { Injectable } from '@nestjs/common';
import { SMSGwDto } from '../dto/sms-gw.dto';
import { KafkaHelper } from '../utils/kafka-helper';
require('dotenv').config(); // setup the necessary kafka configs

@Injectable()
export class SmsRepository {
  constructor(
    private readonly kafkaHelper: KafkaHelper
  ) {}
  async sendSms(sms: SMSGwDto) {
    // send to kafka
    this.kafkaHelper.send(sms['trackId'], sms, 'sendSms', process.env.SMS_API_SEND_SMS_REQUEST);
  }
}
