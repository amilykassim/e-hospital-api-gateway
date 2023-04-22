import { Injectable } from '@nestjs/common';
import { ContactsRequestDTO } from '../dto/contacts-validation-request.dto';
import { KafkaHelper } from '../utils/kafka-helper';
require('dotenv').config(); // setup the necessary kafka configs

@Injectable()
export class ValidateContactsRepository {
  constructor(
    private readonly kafkaHelper: KafkaHelper
  ) {}
  async send(request: ContactsRequestDTO) {
    // send to kafka
    this.kafkaHelper.send(request['trackId'], request, 'sendValidateContactsRequest', process.env.SMS_CONTACTS_VALIDATE_REQUEST_TOPIC);
  }
}
