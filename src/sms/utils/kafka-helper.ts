import { LogHelper } from './../logger/log.helper';
import { Injectable } from '@nestjs/common';
import { AppLogs } from '../logger/app.logs';
const { Kafka } = require('kafkajs');
require('dotenv').config(); // setup the necessary kafka configs
const apm = require('elastic-apm-node').start();

@Injectable()
export class KafkaHelper {
  private producer;
  private transaction;

  constructor() {
    const kafka = new Kafka({
      brokers: [process.env.KAFKA_BROKER_URL],
      retry: { retries: 50 }
    });

    // assign the configs to the producer
    this.producer = kafka.producer();
    this.producer.connect().then(() => {
      AppLogs.producerConnectedLog();
    });
  }
  async send(trackId: string, data: any, transactionName: string, topic: string) {
    // start apm transaction
    this.transaction = apm.startTransaction(transactionName, 'Kafka');

    const messageToBeSent = JSON.stringify(data);
    AppLogs.sendDataToKafkaLog(trackId, data, transactionName, messageToBeSent);

    try {
      // Send the event data to kafka
      await this.producer.send({
        topic: topic,
        // For the header field, it is set to be used by wallet microservice to be able to create the wallet, the name is randomly choosen. (FYI)
        messages: [{ value: messageToBeSent, headers: { appName: 'SMS-API' } }],
      });

      // sent sms successfully to respective agent
      this.transaction.result = 'success';
      this.transaction.end();

      return { isMessageSent: true };
    } catch (error) {
      AppLogs.unexpectedErrorWhileSendingDataToKafka(error);

      // failed to send sms to respective agent
      this.transaction.result = 'error';
      this.transaction.end();
    }
  }
}
