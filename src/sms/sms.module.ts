import { Module } from '@nestjs/common';
import { SmsRepository } from './repository/send-sms.repository';
import { SendSMSController } from './controllers/send-sms.controller';
import { SMSService } from './sms.service';
import { CommandHandlers } from './commands/handlers';
import { EventHandlers } from './events/handlers';
import { CqrsModule } from '@nestjs/cqrs';
import { KafkaHelper } from './utils/kafka-helper';
import { WalletCreationRepository } from './repository/wallet-creation.repository';
import { BillingServiceCostRepository } from './repository/billing-service-cost.repository';
import { BillingSubscriptionRepository } from './repository/billing-subscription.repository';
import { SMSAllocationRepository } from './repository/sms-allocation.repository';
import { WalletSMSBalanceRepository } from './repository/wallet-sms-balance.repository';
import { SMSDeductionRepository } from './repository/sms-deduction.repository';
import { RedisHelper } from './utils/redis-helper';
import { PurchaseSMSController } from './controllers/purchase-sms.controller';
import { WalletCreationController } from './controllers/wallet-creation.controller';
import { WSGateway } from './gateways/websocket.gateway';
import { EventHelper } from './events/event-helper/event.helper';
import { PurchaseSMSLog } from './logger/purchase-sms.logs';
import { WalletCreationLog } from './logger/wallet-creation.log';
import { SendSMSLog } from './logger/send-sms.logs';
import { MyCustomResponse } from './helpers/success-response.helper';
import { AnalyticsController } from './controllers/analytics.controller';
import { AnalyticsService } from './services/analytics.service';
import { AnalyticsLog } from './logger/analytics';
import { WalletBalance } from './services/wallet-balance.service';
import { PurchaseSMSHelper } from './helpers/purchase-sms.helper';
import { ContactsController } from './controllers/contacts.controller';
import { ValidateContactsRepository } from './repository/validate-contacts.repository';
import { PollingHelper } from './helpers/polling.helper';
import { ContactsLog } from './logger/contacts.logs';
import { ContactsService } from './services/contacts.service';
import { RoutesController } from './controllers/routes.controller';
import { RoutesService } from './services/routes.service';
import { RoutesHelper } from './helpers/routes.helper';
import { RoutesLog } from './logger/routes.logs';

@Module({
  imports: [CqrsModule],
  controllers: [
    AnalyticsController,
    WalletCreationController,
    PurchaseSMSController,
    SendSMSController,
    ContactsController,
    RoutesController
  ],
  providers: [
    AnalyticsService,
    SMSService,
    ContactsService,
    SmsRepository,
    WalletCreationRepository,
    BillingServiceCostRepository,
    BillingSubscriptionRepository,
    SMSAllocationRepository,
    WalletSMSBalanceRepository,
    SMSDeductionRepository,
    ValidateContactsRepository,
    KafkaHelper,
    RedisHelper,
    EventHelper,
    PollingHelper,
    PurchaseSMSLog,
    PurchaseSMSHelper,
    WalletCreationLog,
    SendSMSLog,
    ContactsLog,
    AnalyticsLog,
    MyCustomResponse,
    WalletBalance,
    WSGateway,
    RoutesService,
    RoutesHelper,
    RoutesLog,
    ...CommandHandlers,
    ...EventHandlers],
})
export class SMSModule { }
