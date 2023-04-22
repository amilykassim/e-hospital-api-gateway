import { SMSDto } from './sms/dto/send-sms-request.dto';
import { SendSmsHelper } from './sms/helpers/send-sms.helper';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import * as bodyParser from 'body-parser';
require('dotenv').config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(bodyParser.json({limit: '50mb'}));
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

  app.enableCors();
  app.useStaticAssets(join(__dirname, '..', 'static'));
  // microservice #1
  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKER_URL],
        retry: { retries: 50 }
      },
      consumer: {
        groupId: process.env.SMS_API_GROUP_ID,
        retry: { retries: 50 }
      },
    },
  });

  await app.startAllMicroservicesAsync();
  await app.listen(3000);
}
bootstrap();
