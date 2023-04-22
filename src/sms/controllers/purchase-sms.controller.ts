import { Body, Controller, Post, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices/decorators';
import { BillingServiceCostCommand, SMSAllocationCommand } from '../commands/implementation';
import { PaymentRequestDto } from '../dto/payment-request.dto';
import { BillingServiceCostResponseDto } from '../dto/billing-service-cost-response.dto';
import { ValidateSMSPurchase } from '../validation/purchase-sms.validation';
import { ErrorResponse } from '../helpers/error-response.helper';
import { BillingServiceCostRequestDto } from '../dto/billing-service-cost-request.dto';
import { PurchaseSMSDto } from '../dto/purchase-sms-request.dto';
import { v4 as uuidv4 } from 'uuid';
import { RedisHelper } from '../utils/redis-helper';
import axios from 'axios';
import { PaymentResponseDto } from '../dto/payment-response.dto';
import { SMSAllocationResponseDto } from '../dto/sms-allocation-response.dto';
import { EmailNotificationDTO } from '../dto/email-notification.dto';
import { AuthenticatedUser, RoleMatchingMode, Roles, Public } from 'nest-keycloak-connect';
import { PurchaseSMSLog } from '../logger/purchase-sms.logs';
import { AuthenticatedUserDto } from '../dto/authenticated-user.dto';
import { MyCustomResponse } from '../helpers/success-response.helper';
import { WalletBalance } from '../services/wallet-balance.service';
import { PurchaseSMSHelper } from '../helpers/purchase-sms.helper';
import { AdminSMSAllocationRequestDto } from '../dto/admin-sms-allocation-request.dto';
import { ValidateSMSAllocation } from '../validation/allocate-sms.validation';
import { EventHelper } from '../events/event-helper/event.helper';
import { VerifyPaymentRequestDto } from '../dto/verify-payment-request.dto';
import { ValidatePaymentVerificationPayload } from '../validation/verify-payment.validation';
require('dotenv').config();
@Controller('/api/v1')
export class PurchaseSMSController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly redis: RedisHelper,
    private readonly purchaseSMSLog: PurchaseSMSLog,
    private readonly walletBalance: WalletBalance,
    private readonly customResponse: MyCustomResponse,
    private readonly purchaseSMSHelper: PurchaseSMSHelper,
    private readonly eventHelper: EventHelper,
  ) { }

  @Post('/sms/buy')
  @Roles({ roles: ['user'], mode: RoleMatchingMode.ANY })
  async billServiceCost(@AuthenticatedUser() user: AuthenticatedUserDto, @Body(ValidateSMSPurchase) paymentRequest: PurchaseSMSDto, @Res() res) {
    // set merchant ID
    const merchantId: string = user.customer_id;
    const trackId: string = uuidv4();

    // Validate purchase sms request payload with the help of validation pipeline
    if (paymentRequest != undefined && paymentRequest['error']) {
      this.purchaseSMSLog.invalidSMSPurchasePayloadLog(trackId, merchantId, paymentRequest);
      return res.status(400).json(new ErrorResponse(paymentRequest['error']))
    };

    // TODO: DELETER LATER (TEMP FIX)
    let phone = paymentRequest.telephoneNumber;
    if (
      phone.startsWith('078') ||
      phone.startsWith('079') ||
      phone.startsWith('073') ||
      phone.startsWith('072')
    ) {
      phone = '25' + phone;
      paymentRequest.telephoneNumber = phone;
    }

    // If it reaches then it means that the payload is valid
    this.purchaseSMSLog.validSMSPurchasePayloadLog(trackId, merchantId, paymentRequest);

    // Cache user info with merchantId as key in order to be able to send an email to a specific email
    await this.redis.set(`sms-api-${merchantId}`, user);

    // Billing service cost object
    const billingPayload: BillingServiceCostRequestDto = {
      merchantId,
      productName: 'SMS',
      amount: paymentRequest.amount,
      transactionId: uuidv4() // unique identifier
    };

    // Cache payment request
    this.purchaseSMSLog.cachePaymentRequestLog(trackId, paymentRequest);
    paymentRequest['merchantId'] = merchantId; // Set merchant Id to the payment request in oder to be able to use when listening on billing service response
    paymentRequest['trackId'] = trackId;
    paymentRequest['userInfo'] = { name: user['preferred_username'], email: user.email } // set userInfo
    await this.redis.set(billingPayload.transactionId, paymentRequest);

    // Dispatch billing service cost command
    billingPayload['trackId'] = trackId;
    this.purchaseSMSLog.dispatchBillingServiceCostLog(trackId, billingPayload);
    await this.commandBus.execute(new BillingServiceCostCommand(billingPayload));

    // return an acknowlegement to the user that the sms request was accepted and is being processed
    return res.status(200).json(this.customResponse.success(trackId, merchantId));
  }

  @MessagePattern(process.env.BILLING_SERVICE_COST_RESPONSE_TOPIC)
  async requestPayment(@Payload() payload) {
    const billingResponse: BillingServiceCostResponseDto = payload.value;
    const { result } = billingResponse;

    // Get cached payment request
    const paymentRequest: PaymentRequestDto = await this.redis.getAndDel(billingResponse.transactionId);
    if (paymentRequest == null) return this.purchaseSMSLog.unableToRetriveRedisDataLog('Unable to retrive payment request cached data', billingResponse.transactionId);

    const merchantId: string = paymentRequest['merchantId'];
    const trackId: string = paymentRequest['trackId'];
    this.purchaseSMSLog.billedServiceCostResponseLog(trackId, paymentRequest);

    // If there is no result in the response, log and return immediately
    this.purchaseSMSLog.checkIfNumberOfSMSIsProvidedLog(trackId);
    if (result == null || result == undefined) {

      this.purchaseSMSLog.numberOfSMSIsNotProvidedLog(trackId, merchantId);
      return console.log(`Received result as ${result} from billing microservice`);
    }

    // Round down the result (number of sms) to an integer
    const numberOfSMS: number = parseInt(billingResponse.result.toString(), 10);

    // Check if payment request is Flutterwave payment or BasePay
    // 1. If it's flutterwave, then allocate SMS directly
    if (paymentRequest['metadata'] && paymentRequest['metadata']['flw']) {
      const emailAddress = paymentRequest['metadata']['flw']['userInfo']['email'];
      const username = paymentRequest['metadata']['flw']['userInfo']['name'];
      const smsAllocationPayload = this.purchaseSMSHelper.getSMSAllocationPayload(trackId, merchantId, numberOfSMS, emailAddress);
      this.purchaseSMSLog.dispatchSMSAllocationLog(smsAllocationPayload);
      await this.commandBus.execute(new SMSAllocationCommand(smsAllocationPayload));

      return this.purchaseSMSHelper.sendPurchaseActivityEvent(trackId, merchantId, numberOfSMS, username);
    }

    // 2. If it's BasePay then ask BasePay to prompt the user to pay
    // if it reaches here, then it indicates that the result (number of SMS) is provided
    this.purchaseSMSLog.computeExactAmountToChargeLog(trackId, merchantId);

    // Compute amount to charge the user
    const exactAmountToCharge = (numberOfSMS * paymentRequest.amount) / billingResponse.result;

    paymentRequest.callbackUrl = `${process.env.SMS_API_BASE_URL}/api/v1/sms/payments/callback`;
    paymentRequest['currency'] = 'RWF';
    paymentRequest.description = 'Purchase SMS';
    paymentRequest.amount = exactAmountToCharge;
    paymentRequest['merchantTransactionId'] = trackId; // use trackid as txid to assist with viewing logs across two domains, i.e sms and payment domain
    paymentRequest['payerTelephoneNumber'] = paymentRequest.telephoneNumber;
    delete paymentRequest['merchantId']; // delete the merchant Id attached while checking the service cost in billServiceCost method
    delete paymentRequest['trackId']; // delete the track Id attached while checking the service cost in billServiceCost method

    /**
     * PS: Set the merchantId on the cached billing response so that it can be used
     * When sending sms allocation payload in the payment callback
     * 
     * And set phone number in order to track the phone number that was billed.
     */
    billingResponse['merchantId'] = merchantId;
    billingResponse['trackId'] = trackId;
    billingResponse['phoneNumber'] = paymentRequest.telephoneNumber;
    billingResponse['userInfo'] = paymentRequest['userInfo']; // set userInfo

    this.purchaseSMSLog.cacheBillingResponseLog(billingResponse);
    await this.redis.set(paymentRequest['merchantTransactionId'], billingResponse);

    try {
      // authenticate (get token)
      const token = await this.purchaseSMSHelper.authenticate(trackId);

      // Send to BasePay
      const headers = { Authorization: `Bearer ${token}` };
      this.purchaseSMSLog.initiatePaymentLog(trackId, { paymentRequest }, process.env.BASE_PAY_URL);
      const { data } = await axios.post(process.env.BASE_PAY_URL, paymentRequest, { headers });
      const paymentResponse: PaymentResponseDto = data;

      // Unable to send the payment request successfully
      if (paymentResponse['code'] != '200') {
        return this.purchaseSMSLog.unableToSendPaymentRequestSuccessfully(trackId, merchantId, data.description);
      }

      // Sent the payment request successfully
      this.purchaseSMSLog.sentPaymentRequestSuccessfully(trackId, merchantId, paymentRequest);
    } catch (error) {
      return this.purchaseSMSLog.errorOccuredLog(trackId, error, 'Initiate payment');
    }
  }

  @Post('/sms/payments/callback')
  @Public()
  async paymentCallback(@Payload() paymentResponse: PaymentResponseDto) {
    // Get the cached billing response object
    const billingResponse: BillingServiceCostResponseDto = await this.redis.getAndDel(paymentResponse.merchantTransactionId);
    if (billingResponse == null) return this.purchaseSMSLog.unableToRetriveRedisDataLog('Unable to retrive billing response cached data', paymentResponse.merchantTransactionId);

    this.purchaseSMSLog.paymentCallbackResponseLog(billingResponse);

    // Handle error when payment fails
    if (parseInt(paymentResponse.statusCode) !== 200) {
      return this.purchaseSMSLog.paymentFailedLog(paymentResponse, billingResponse);
    }

    // if it reaches it means, the payment has succeeded
    this.purchaseSMSLog.paymentSucceededLog(paymentResponse, billingResponse);

    // Get email from cached merchant ID in setSubscription payment
    const user: AuthenticatedUserDto = await this.redis.getAndDel(`sms-api-${billingResponse['merchantId']}`);
    if (user == null) return this.purchaseSMSLog.unableToRetriveRedisDataLog('Unable to retrive user cached data', `sms-api-${billingResponse['merchantId']}`);

    const merchantId = billingResponse['merchantId'];
    const amount = parseInt(billingResponse.result.toString(), 10);
    const emailAddress = user.email;
    const trackId = billingResponse['trackId'];
    const smsAllocationPayload = this.purchaseSMSHelper.getSMSAllocationPayload(trackId, merchantId, amount, emailAddress);

    this.purchaseSMSLog.dispatchSMSAllocationLog(smsAllocationPayload);
    await this.commandBus.execute(new SMSAllocationCommand(smsAllocationPayload));

    // Source activity events
    const event = {
      verb: "purchased",
      customerid: merchantId,
      indirectObject: '',
      directObject: `${amount} SMS`,
      eventType: "PURCHASE",
      category: "PURCHASE",
      username: billingResponse['userInfo']['name'],
      timestamp: new Date()
    }
    this.eventHelper.sendActivityEvents(billingResponse['trackId'], event);
  }

  @Post('/sms/verify/payment')
  @Roles({ roles: ['user'], mode: RoleMatchingMode.ANY })
  async verifyFlutterWavePayment(@AuthenticatedUser() user: AuthenticatedUserDto, @Body(ValidatePaymentVerificationPayload) paymentRequest: VerifyPaymentRequestDto, @Res() res) {
    // set merchant ID
    const merchantId: string = user.customer_id;
    const trackId: string = uuidv4();

    // Validate purchase sms request payload with the help of validation pipeline
    if (paymentRequest != undefined && paymentRequest['error']) {
      this.purchaseSMSLog.invalidVerifyPaymentPayloadLog(trackId, merchantId, paymentRequest);
      return res.status(400).json(new ErrorResponse(paymentRequest['error']));
    };
    this.purchaseSMSLog.validVerifyPaymentPayloadLog(trackId, merchantId, paymentRequest);

    // verify flw payment
    const { status, message } = await this.purchaseSMSHelper.verifyFlwPayment(paymentRequest);
    if (status === 'error') {
      this.purchaseSMSLog.failedToverifyPaymentLog(trackId, merchantId, message);
      return res.status(402).json({ statusCode: 402, message: 'payment verification failed', trackId });
    }

    this.purchaseSMSLog.verifiedPaymentLog(trackId, merchantId);
    const billingPayload = this.purchaseSMSHelper.getBillingServiceCostPayload(trackId, merchantId, paymentRequest.amount);
    paymentRequest['trackId'] = trackId;
    paymentRequest['metadata'] = { flw: { userInfo: user } };
    await this.redis.set(billingPayload.transactionId, paymentRequest);

    this.purchaseSMSLog.dispatchBillingServiceCostLog(trackId, billingPayload);
    await this.commandBus.execute(new BillingServiceCostCommand(billingPayload));

    return res.status(200).json({ statusCode: 200, message, trackId });
  }


  @Post('/admin/sms/allocate')
  @Roles({ roles: ['basesms_admin'] })
  async allocateSMS(@AuthenticatedUser() user: AuthenticatedUserDto, @Body(ValidateSMSAllocation) allocateSMSRequest: AdminSMSAllocationRequestDto, @Res() res) {
    // Validate allocate sms request payload
    if (allocateSMSRequest != undefined && allocateSMSRequest['error']) {
      return res.status(400).json(new ErrorResponse(allocateSMSRequest['error']))
    };

    const merchantId = allocateSMSRequest.merchantId;
    const amount = allocateSMSRequest.numberOfSMS;
    const email = allocateSMSRequest.email;
    const trackId = uuidv4();
    const smsAllocationPayload = this.purchaseSMSHelper.getSMSAllocationPayload(trackId, merchantId, amount, email);

    this.purchaseSMSLog.paymentDoneForSMSAllocationLog(trackId, merchantId, allocateSMSRequest);

    this.purchaseSMSLog.dispatchSMSAllocationLog(smsAllocationPayload);
    await this.commandBus.execute(new SMSAllocationCommand(smsAllocationPayload));

    return res.status(200).json(this.customResponse.success(smsAllocationPayload['trackId'], merchantId));
  }

  @MessagePattern(process.env.WALLET_SMS_ALLOCATE_RESPONSE_TOPIC)
  async listenForSMSAllocationResponse(@Payload() payload) {
    const smsAllocationResponse: SMSAllocationResponseDto = payload.value;

    const merchantId: string = smsAllocationResponse['metadata']['request']['merchantId'];
    const trackId: string = smsAllocationResponse['metadata']['request']['trackId'];
    const email: string = smsAllocationResponse['metadata']['request']['metadata']['email'];

    // Failed to allocate sms
    if (smsAllocationResponse.status == 'FAILED') {
      this.purchaseSMSLog.failedSMSAllocationSuccessfullyLog(trackId, smsAllocationResponse);
      return console.log('Failed to allocate sms...');
    }

    // if it reaches it means, the payment has succeeded
    this.purchaseSMSLog.allocatedSMSSuccessfullyLog(trackId, smsAllocationResponse);

    // check wallet balance after allocation SMS
    this.walletBalance.checkWalletSMSBalance(trackId, merchantId);

    // send email notification
    this.sendEmailNotification(trackId, merchantId, email);
  }

  //* THIS SHOULD BE IN THE HELPER CLASS (WILL CHANGE IT LATER)
  async sendEmailNotification(trackId: string, merchantId: string, email: string) {
    try {
      // Construct email notification payload
      const notification = {
        "sender": { "name": "Oltranz ltd", "email": "accounts@oltranz.com" },
        "to": [email],
        "subject": "Purchased SMS successfully",
        "htmlContent": "<p><b>SMS purchase done successfully!</b></p>"
      };

      // Send email notification
      const { data } = await axios.post(process.env.EMAIL_NOTIFICATION_URL, notification);
      const notificationResponse: EmailNotificationDTO = data;

      // Check if email notification was sent successfully
      if (notificationResponse.statusCode == 200)
        this.purchaseSMSLog.emailSentSuccessfullyLog(trackId, merchantId);
      else
        this.purchaseSMSLog.failedToSendEmailLog(trackId, merchantId);
    } catch (error) {
      console.log('There is an error while trying to send an email ===> ', error);
    }
  }
}
