import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Injectable } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { SMSDto } from 'src/sms/dto/send-sms-request.dto';
import { PurchaseSMSDto } from 'src/sms/dto/purchase-sms-request.dto';
import { WalletCreationRequestDto } from 'src/sms/dto/wallet-creation-request.dto';
import { CommandBus, CqrsModule } from '@nestjs/cqrs';
import { BillingServiceCostCommand, BillingSubscriptionCommand, SendSMSCommand, SMSAllocationCommand, SMSDeductionCommand, WalletCreationCommand, WalletSMSBalanceCommand } from '../src/sms/commands/implementation';
import { BillingSubscriptionRequestDto } from 'src/sms/dto/billing-subscription-request.dto';
import { CommandHandlers } from '../src/sms/commands/handlers';
import { EventHandlers } from '../src/sms/events/handlers';
import { BillingServiceCostEvent, BillingSubscriptionEvent } from '../src/sms/events/implementation';
import { SmsRepository } from '../src/sms/repository/send-sms.repository';
import { BillingServiceCostRepository } from '../src/sms/repository/billing-service-cost.repository';
import { BillingSubscriptionRepository } from '../src/sms/repository/billing-subscription.repository';
import { SMSAllocationRepository } from '../src/sms/repository/sms-allocation.repository';
import { SMSDeductionRepository } from '../src/sms/repository/sms-deduction.repository';
import { WalletCreationRepository } from '../src/sms/repository/wallet-creation.repository';
import { WalletSMSBalanceRepository } from '../src/sms/repository/wallet-sms-balance.repository';
import { WSGateway } from '../src/sms/gateways/websocket.gateway';
import { KafkaHelper } from '../src/sms/utils/kafka-helper';
import { RedisHelper } from '../src/sms/utils/redis-helper';
import { BillingSubscriptionEventHandler } from '../src/sms/events/handlers/billing-subscription-event.handler';
import { BillingServiceCostRequestDto } from '../src/sms/dto/billing-service-cost-request.dto';
import { SMSAllocationRequestDto } from '../src/sms/dto/sms-allocation-request.dto';
import { WalletSMSBalanceRequestDto } from '../src/sms/dto/wallet-sms-balance-request';
import { SMSGwDto } from '../src/sms/dto/sms-gw.dto';
import { SMSDeductionRequestDto } from '../src/sms/dto/sms-deduction-request.dto';
import { SendSMSCommandHandler } from '../src/sms/commands/handlers/send-sms-command.handler';
import { WalletSMSBalanceEventHandler } from '../src/sms/events/handlers/wallet-sms-balance-event.handler';
import { WalletSMSBalanceCommandHandler } from '../src/sms/commands/handlers/wallet-sms-balance-command.handler';
import { SendSmsEventHandler } from '../src/sms/events/handlers/send-sms-event.handler';
import { SMSDeductionEventHandler } from '../src/sms/events/handlers/sms-deduction-event.handler';
import { SMSDeductionCommandHandler } from '../src/sms/commands/handlers/sms-deduction-command.handler';
import { BillingServiceCostCommandHandler } from '../src/sms/commands/handlers/billing-service-cost-command.handler';
import { SMSAllocationCommandHandler } from '../src/sms/commands/handlers/sms-allocation-command.handler';
import { BillingServiceCostEventHandler } from '../src/sms/events/handlers/billing-service-cost-event.handler';
import { SMSAllocationEventHandler } from '../src/sms/events/handlers/sms-allocation-event.handler';
import axios from 'axios';
const qs = require('qs');

describe('/(SMS Module)', () => {
  let app: INestApplication;
  let token: string;
  let sendSMSPayload: SMSDto;
  let purchaseSMSPayload: any;
  let createSMSWalletPayload: WalletCreationRequestDto;
  let walletCreationCqrsTest: WalletCreationCqrsTest;
  let billingSubscriptionEventHandler: BillingSubscriptionEventHandler;
  let sendSMSCommandHandler: SendSMSCommandHandler;
  let walletSMSBalanceCommandHandler: WalletSMSBalanceCommandHandler;
  let walletSMSBalanceEventHandler: WalletSMSBalanceEventHandler;
  let sendSmsEventHandler: SendSmsEventHandler;
  let smsDeductionCommandHandler: SMSDeductionCommandHandler;
  let smsDeductionEventHandler: SMSDeductionEventHandler;
  let billingServiceCostCommandHandler: BillingServiceCostCommandHandler;
  let billingServiceCostEventHandler: BillingServiceCostEventHandler;
  let smsAllocationCommandHandler: SMSAllocationCommandHandler;
  let smsAllocationEventHandler: SMSAllocationEventHandler;
  let kafkaHelper: KafkaHelper;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, CqrsModule],
      providers: [
        WalletCreationCqrsTest,
        SmsRepository,
        WalletCreationRepository,
        BillingServiceCostRepository,
        BillingSubscriptionRepository,
        SMSAllocationRepository,
        WalletSMSBalanceRepository,
        SMSDeductionRepository,
        KafkaHelper,
        RedisHelper,
        WSGateway,
        ...CommandHandlers,
        ...EventHandlers
      ]
    }).compile();

    // wallet creation
    walletCreationCqrsTest = await moduleFixture.get<WalletCreationCqrsTest>(WalletCreationCqrsTest);
    billingSubscriptionEventHandler = await moduleFixture.get<BillingSubscriptionEventHandler>(BillingSubscriptionEventHandler);

    // send sms
    walletSMSBalanceCommandHandler = await moduleFixture.get<WalletSMSBalanceCommandHandler>(WalletSMSBalanceCommandHandler);
    walletSMSBalanceEventHandler = await moduleFixture.get<WalletSMSBalanceEventHandler>(WalletSMSBalanceEventHandler);
    sendSMSCommandHandler = await moduleFixture.get<SendSMSCommandHandler>(SendSMSCommandHandler);
    sendSmsEventHandler = await moduleFixture.get<SendSmsEventHandler>(SendSmsEventHandler);
    smsDeductionCommandHandler = await moduleFixture.get<SMSDeductionCommandHandler>(SMSDeductionCommandHandler);
    smsDeductionEventHandler = await moduleFixture.get<SMSDeductionEventHandler>(SMSDeductionEventHandler);

    // purchase sms
    billingServiceCostCommandHandler = await moduleFixture.get<BillingServiceCostCommandHandler>(BillingServiceCostCommandHandler);
    billingServiceCostEventHandler = await moduleFixture.get<BillingServiceCostEventHandler>(BillingServiceCostEventHandler);
    smsAllocationCommandHandler = await moduleFixture.get<SMSAllocationCommandHandler>(SMSAllocationCommandHandler);
    smsAllocationEventHandler = await moduleFixture.get<SMSAllocationEventHandler>(SMSAllocationEventHandler);

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  const sendSms = async () => {
    return request(app.getHttpServer())
      .post('/api/v1/sms/send')
      .set('Authorization', 'Bearer ' + token)
      .send(sendSMSPayload);
  };

  const purchaseSMS = async () => {
    return request(app.getHttpServer())
      .post('/api/v1/sms/buy')
      .set('Authorization', 'Bearer ' + token)
      .send(purchaseSMSPayload);
  };

  const getSMSBalance = async () => {
    return request(app.getHttpServer())
      .get('/api/v1/sms/balance')
      .set('Authorization', 'Bearer ' + token);
  };

  const getTimelineEventsHistory = async () => {
    return request(app.getHttpServer())
      .get('/api/v1/sms/balance')
      .set('Authorization', 'Bearer ' + token);
  };

  const getPurchaseHistory = async () => {
    return request(app.getHttpServer())
      .get('/api/v1/sms/balance')
      .set('Authorization', 'Bearer ' + token);
  };

  const getCampaignHistory = async () => {
    return request(app.getHttpServer())
      .get('/api/v1/sms/balance')
      .set('Authorization', 'Bearer ' + token);
  };

  const authenticate = async () => {
    let config = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };

    const payload = {
      client_secret: 'b07f33a3-ce6f-493f-8e35-f80904390661',
      client_id: 'amily-inc',
      grant_type: 'client_credentials'
    }

    try {
      const res = await axios.post(
        'https://auth.oltranz.com/auth/realms/api/protocol/openid-connect/token',
        qs.stringify(payload),
        config);

      // Set the token that will be used across other tests
      token = res.data.access_token;
      return token;
    } catch (error) {
      console.log('\n\n\n>>> the error of authentication \n\n\n', error);
    }
  };

  const expectBadRequestResponse = (statusCode: number, body: any) => {
    expect(statusCode).toEqual(400);
    expect(body).toHaveProperty('code');
    expect(body.code).toEqual(400);
    expect(body).toHaveProperty('error');
  };

  const expectSuccessResponse = (statusCode: number, body: any) => {
    expect(statusCode).toEqual(200);
    expect(body).toHaveProperty('code');
    expect(body.code).toEqual(200);
    expect(body).toHaveProperty('message');
  };

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Initiate send sms dummy payload
    sendSMSPayload = {
      title: "title",
      message: "message",
      receivers: ["0788888888"]
    };

    // Initiate buy sms dummy payload
    purchaseSMSPayload = {
      telephoneNumber: "0788888888",
      amount: 8,
    };

    // Initiate create wallet sms dummy payload
    createSMSWalletPayload = {
      ownerId: "7e0080806070349b0160732547c0000a",
      ownerName: "Oltranz Inc",
      email: "amilykassim02@gmail.com",
      phone: "250782228870",
    };
  });

  describe('/sms/send', () => {
    it('should return 200 when a valid sms request payload is provided', async () => {
      await authenticate();

      const { body, statusCode } = await sendSms();

      expectSuccessResponse(statusCode, body);
      expect(body.message).toEqual('Request received successfully and is currently being processed')
    });

    it('should return 400 when invalid title is passed', async () => {
      let invalidSmsPayload = sendSMSPayload;
      invalidSmsPayload.title = ''; // remove the title

      const { body, statusCode } = await sendSms();

      expectBadRequestResponse(statusCode, body);
      expect(body.error).toEqual('\"title\" is not allowed to be empty');
    });

    it('should return 400 when invalid message is passed', async () => {
      let invalidSmsPayload = sendSMSPayload;
      invalidSmsPayload.message = ''; // remote the message

      const { body, statusCode } = await sendSms();

      expectBadRequestResponse(statusCode, body);
      expect(body.error).toEqual('\"message\" is not allowed to be empty');
    });

    it('should return 400 when empty receivers are passed', async () => {
      let invalidSmsPayload = sendSMSPayload;
      invalidSmsPayload.receivers = ['']; // remove the receivers

      const { body, statusCode } = await sendSms();

      expectBadRequestResponse(statusCode, body);
      expect(body.error).toEqual('\"receivers[0]\" is not allowed to be empty');
    });

    it('should return 400 when invalid receiver\'s phone number are passed', async () => {
      let invalidSmsPayload = sendSMSPayload;
      invalidSmsPayload.receivers = ['07822']; // make phone invalid

      const { body, statusCode } = await sendSms();

      expectBadRequestResponse(statusCode, body);
      expect(body.error).toEqual("\"receivers[0]\" length must be at least 6 characters long");
    });
  });

  describe('/sms/buy', () => {
    it('should return 200 when a valid sms purchase request payload is provided', async () => {

      const { body, statusCode } = await purchaseSMS();

      expectSuccessResponse(statusCode, body);
      expect(body.message).toEqual('Request received successfully and is currently being processed')
    });

    it('should return 400 when amount is not provided', async () => {
      let invalidSmsPayload = purchaseSMSPayload;
      delete invalidSmsPayload.amount; // remove the amount

      const { body, statusCode } = await purchaseSMS();

      expectBadRequestResponse(statusCode, body);
      expect(body.error).toEqual('\"amount\" is required');
    });

    it('should return 400 when a negative amount is provided', async () => {
      let invalidSmsPayload = purchaseSMSPayload;
      invalidSmsPayload.amount = -1; // make amount invalid

      const { body, statusCode } = await purchaseSMS();

      expectBadRequestResponse(statusCode, body);
      expect(body.error).toContain('\"amount\" must be greater than or equal to');
    });

    it('should return 400 when telephone number is not provided', async () => {
      let invalidSmsPayload = purchaseSMSPayload;
      invalidSmsPayload.telephoneNumber = ''; // remote the phone number

      const { body, statusCode } = await purchaseSMS();

      expectBadRequestResponse(statusCode, body);
      expect(body.error).toEqual('\"telephoneNumber\" is not allowed to be empty');
    });
  });

  // describe('/sms/balance', () => {
  //   it('should return 200 when a valid sms balance request payload is provided', async () => {
  //     const { body, statusCode } = await getSMSBalance();

  //     expectSuccessResponse(statusCode, body);
  //     expect(body.message).toEqual('Request received successfully and is being processed')
  //   });
  // });

  // describe('/sms/timelineEventsHistory', () => {
  //   it('should return 200 when a valid sms balance request payload is provided', async () => {
  //     const { body, statusCode } = await getTimelineEventsHistory();

  //     expectSuccessResponse(statusCode, body);
  //     expect(body.message).toEqual('Request received successfully and is being processed')
  //   });
  // });

  // describe('/sms/purchaseHistory', () => {
  //   it('should return 200 when a valid sms balance request payload is provided', async () => {
  //     const { body, statusCode } = await getPurchaseHistory();

  //     expectSuccessResponse(statusCode, body);
  //     expect(body.message).toEqual('Request received successfully and is being processed')
  //   });
  // });

  // describe('/sms/campaignHistory', () => {
  //   it('should return 200 when a valid sms balance request payload is provided', async () => {
  //     const { body, statusCode } = await getCampaignHistory();

  //     expectSuccessResponse(statusCode, body);
  //     expect(body.message).toEqual('Request received successfully and is being processed')
  //   });
  // });
});

@Injectable()
export class WalletCreationCqrsTest {
  constructor(
    private readonly commandBus: CommandBus,
  ) { }

  async testBillingSubscriptionCommandHandler(subscription: BillingSubscriptionRequestDto) {
    return this.commandBus.execute(new BillingSubscriptionCommand(subscription));
  }

  async testWalletCreationCommandHandler(wallet: WalletCreationRequestDto) {
    return this.commandBus.execute(new WalletCreationCommand(wallet));
  }
}

@Injectable()
export class PurchaseSMSCqrsTest {
  constructor(
    private readonly commandBus: CommandBus,
  ) { }

  async testBillingServiceCostCommand(payload: BillingServiceCostRequestDto) {
    return this.commandBus.execute(new BillingServiceCostCommand(payload));
  }

  async testSMSAllocationCommand(payload: SMSAllocationRequestDto) {
    return this.commandBus.execute(new SMSAllocationCommand(payload));
  }
}

@Injectable()
export class SendSMSCqrsTest {
  constructor(
    private readonly commandBus: CommandBus,
  ) { }

  async testWalletSMSBalanceCommand(payload: WalletSMSBalanceRequestDto) {
    return this.commandBus.execute(new WalletSMSBalanceCommand(payload));
  }

  async testSendSMSCommand(payload: SMSGwDto) {
    return this.commandBus.execute(new SendSMSCommand(payload));
  }

  async testSMSDeductionCommand(payload: SMSDeductionRequestDto) {
    return this.commandBus.execute(new SMSDeductionCommand(payload));
  }
}
