import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices/decorators';
import { BillingSubscriptionCommand, SMSAllocationCommand, WalletCreationCommand } from '../commands/implementation';
import { BillingSubscriptionRequestDto } from '../dto/billing-subscription-request.dto';
import { WalletCreationRequestDto } from '../dto/wallet-creation-request.dto';
import { BillingSubscriptionResponseDto } from '../dto/billing-subscription-response.dto';
import { WalletCreationResponseDto } from '../dto/wallet-creation-response.dto';
import { ValidateWalletCreation } from '../validation/wallet-creation-validation';
import { WalletCreationLog } from '../logger/wallet-creation.log';
import { WalletBalance } from '../services/wallet-balance.service';
import { v4 as uuidv4 } from 'uuid';
import { RedisHelper } from '../utils/redis-helper';
import { SMSAllocationRequestDto } from '../dto/sms-allocation-request.dto';
import { KafkaHelper } from '../utils/kafka-helper';
require('dotenv').config();

@Controller('/api/v1')
export class WalletCreationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly walletCreationLog: WalletCreationLog,
    private readonly walletBalance: WalletBalance,
    private readonly redis: RedisHelper,
    private readonly kafkaHelper: KafkaHelper,
  ) {
  }
  @MessagePattern(process.env.KEYCLOAK_REGISTER_TOPIC)
  async createWallet(@Payload() payload) {
    const registerEvent = payload.value;
    const trackId = uuidv4();

    // Extract registration info
    const clientId = registerEvent.clientId;
    const eventType = registerEvent.eventType;

    // Check if it is a register event and coming from base sms client
    if ((clientId == process.env.BASE_SMS_CLIENTID || clientId == process.env.BASE_SUITE_MKEL_CLIENTID) && eventType == 'REGISTER') {
      // Extract customer info
      const userInfo = {
        customerId: registerEvent.userId,
        email: registerEvent.customerInfo.attributes.email[0],
        phoneNumber: registerEvent.customerInfo.attributes.phoneNumber[0],
        ownerName: registerEvent.customerInfo.attributes.username[0],
      }

      this.askWalletMicroserviceToCreateWallet(trackId, userInfo, clientId);
    }
  }

  async askWalletMicroserviceToCreateWallet(trackId: string, userInfo, clientId?: string) {
    // Set the type and the merchantId to the wallet payload
    let wallet: WalletCreationRequestDto = {
      type: 'SMS',
      ownerId: userInfo.customerId,
      ownerName: userInfo.ownerName,
      phone: userInfo.phoneNumber,
      email: userInfo.email,
    }

    const { error } = ValidateWalletCreation.validateCreatewalletPayload(wallet);

    // add trackId
    wallet['trackId'] = trackId;

    // Validate send sms request payload with the help of validation pipeline
    if (error) {
      wallet['error'] = error.details[0].message;
      this.walletCreationLog.invalidWalletPayloadLog(wallet);
      return; // return immediately
    }

    // If it reaches here, it means the payload is valid
    this.walletCreationLog.validWalletPayloadLog(wallet);

    // Set subscription
    const subscription: BillingSubscriptionRequestDto = {
      merchantId: wallet.ownerId,
      productName: wallet.type
    }

    if (process.env.BASE_SUITE_MKEL_CLIENTID == clientId) {
      subscription.computation = 'UNIT';
      subscription.chargeValue = Number(process.env.SMS_CHARGE_VALUE) || 5;
    }

    // Cached wallet creation request
    await this.redis.set(wallet.ownerId, wallet);

    // Dispatch billing subscription command
    subscription['trackId'] = trackId;
    this.walletCreationLog.setBillingSubscriptionLog(subscription, wallet);
    await this.commandBus.execute(new BillingSubscriptionCommand(subscription));

    // Dispatch creating wallet command
    this.walletCreationLog.setCreateWalletLog(wallet);
    await this.commandBus.execute(new WalletCreationCommand(wallet));
  }

  @MessagePattern(process.env.BILLING_SUBSCRIPTION_RESPONSE_TOPIC)
  async listenToBillingSubscriptionResponse(@Payload() payload) {
    const subscriptionResponse: BillingSubscriptionResponseDto = payload.value;
    const { error } = subscriptionResponse;

    // If not unable to set the subscription payment
    if (error) return this.walletCreationLog.unableToSetBillingSubscriptionLog(error);

    // Set the billing subscription successfully
    return this.walletCreationLog.setBillingSubscriptionSuccessfullyLog();
  }

  @MessagePattern(process.env.WALLET_CREATE_RESPONSE_TOPIC)
  async listenToWalletCreationResponse(@Payload() payload) {
    const walletResponse: WalletCreationResponseDto = payload.value;

    // Get cached request
    const result = await this.redis.getAndDel(walletResponse.merchantId);
    walletResponse['trackId'] = result['trackId'];

    // Unable to create wallet successfully
    if (!walletResponse.merchantId) return this.walletCreationLog.unableToCreateWalletLog(walletResponse);

    // Created wallet successfully
    this.walletCreationLog.createWalletSuccessfullyLog(walletResponse);

    // Create sms allocation payload
    const smsAllocationPayload: SMSAllocationRequestDto = {
      merchantId: walletResponse.merchantId,
      amount: Number(process.env.FREE_SMS),
      description: 'SMS Allocation',
      transactionId: uuidv4(),
    };
    smsAllocationPayload['trackId'] = walletResponse['trackId'];

    // cached wallet response in order to access trackId and merchantId after sms allocation
    await this.redis.set(smsAllocationPayload.transactionId, walletResponse);

    await this.commandBus.execute(new SMSAllocationCommand(smsAllocationPayload));

    // check SMS balance after creating the wallet
    this.walletBalance.checkWalletSMSBalance(walletResponse['trackId'], walletResponse.merchantId);
  }
}
