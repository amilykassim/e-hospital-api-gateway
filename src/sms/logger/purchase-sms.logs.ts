import { VerifyPaymentRequestDto } from './../dto/verify-payment-request.dto';
import { Injectable } from "@nestjs/common";
import { AdminSMSAllocationRequestDto } from "../dto/admin-sms-allocation-request.dto";
import { BillingServiceCostRequestDto } from "../dto/billing-service-cost-request.dto";
import { BillingServiceCostResponseDto } from "../dto/billing-service-cost-response.dto";
import { PaymentResponseDto } from "../dto/payment-response.dto";
import { PurchaseSMSDto } from "../dto/purchase-sms-request.dto";
import { SMSAllocationRequestDto } from "../dto/sms-allocation-request.dto";
import { SMSAllocationResponseDto } from "../dto/sms-allocation-response.dto";
import { StatusTrackingDto } from "../dto/status-tracking.dto";
import { EventHelper } from "../events/event-helper/event.helper";
import { KafkaHelper } from "../utils/kafka-helper";
import { AppConstants } from "./app.constants";
import { LogHelper } from "./log.helper";
require('dotenv').config();

/**
 *
 * @author amilykassim
 */

@Injectable()
export class PurchaseSMSLog {
  constructor(
    private readonly eventHelper: EventHelper,
    private readonly kafkaHelper: KafkaHelper,
  ) { }

  validSMSPurchasePayloadLog(trackId: string, merchantId: string, paymentRequest: PurchaseSMSDto) {
    let args = {
      message: `Validated SMS purchase request payload successfully... ==> ${JSON.stringify(paymentRequest)}`,
      '@timestamp': new Date(),
      trackId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'billServiceCost()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    this.eventHelper.sendEvent(trackId, merchantId, 'Verified SMS purchase request payload!');
  }

  validVerifyPaymentPayloadLog(trackId: string, merchantId: string, paymentRequest: VerifyPaymentRequestDto) {
    let args = {
      message: `Validated request payload successfully... ==> ${JSON.stringify(paymentRequest)}`,
      '@timestamp': new Date(),
      trackId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'verifyPayment()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    this.eventHelper.sendEvent(trackId, merchantId, args.message);
  }

  invalidSMSPurchasePayloadLog(trackId: string, merchantId: string, paymentRequest: PurchaseSMSDto) {
    let args = {
      message: `Invalid SMS purchase request payload... ==> ${paymentRequest['error']}`,
      '@timestamp': new Date(),
      trackId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'billServiceCost()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    this.eventHelper.sendEvent(trackId, merchantId, `Invalid SMS purchase request payload... ==> ${paymentRequest['error']}`);
  }

  invalidVerifyPaymentPayloadLog(trackId: string, merchantId: string, paymentRequest: VerifyPaymentRequestDto) {
    let args = {
      message: `Invalid request payload... ==> ${paymentRequest['error']}`,
      '@timestamp': new Date(),
      trackId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'verifyPayment()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    this.eventHelper.sendEvent(trackId, merchantId, args.message);
  }

  cachePaymentRequestLog(trackId: string, paymentRequest: PurchaseSMSDto) {
    let args = {
      message: `Cache payment request to redis... ==> ${JSON.stringify(paymentRequest)}`,
      '@timestamp': new Date(),
      trackId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'billServiceCost()',
      eventId: '901',
    };
    LogHelper.logInfo(args);
  }

  dispatchBillingServiceCostLog(trackId: string, billingServiceCost: BillingServiceCostRequestDto) {
    let args = {
      message: `Dispatch/trigger billing service cost command... ==> ${JSON.stringify(billingServiceCost)}`,
      '@timestamp': new Date(),
      trackId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'billServiceCost()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    this.eventHelper.sendEvent(trackId, billingServiceCost.merchantId, `Asked billing service to calculate the service cost for SMS product...`);
  }

  billedServiceCostResponseLog(trackId: string, paymentRequest: PurchaseSMSDto) {
    let args = {
      message: `Received a response regarding billing service cost from wallet and we've also immediately fetched the cached payment request from redis... ${JSON.stringify(paymentRequest)}`,
      '@timestamp': new Date(),
      trackId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'requestPayment()',
      eventId: '901',
    };
    LogHelper.logInfo(args);
  }

  unableToRetriveRedisDataLog(message: string, transactionId: string) {
    let args = {
      message: `${message} with this key: ${transactionId}`,
      '@timestamp': new Date(),
      trackId: '',
      type: AppConstants.REQUEST_TYPE,
      threadName: 'requestPayment()',
      eventId: '901',
    };
    LogHelper.logInfo(args);
  }

  checkIfNumberOfSMSIsProvidedLog(trackId: string) {
    let args = {
      message: `Check if number of SMS is provided the wallet response...`,
      '@timestamp': new Date(),
      trackId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'requestPayment()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

  }

  numberOfSMSIsNotProvidedLog(trackId: string, merchantId: string) {
    let args = {
      message: `Number of SMS is not provided in the wallet response...`,
      '@timestamp': new Date(),
      trackId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'requestPayment()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    this.eventHelper.sendEvent(trackId, merchantId, `The response from the billing service is not valid, it doesn't contain the number of SMS data which is required to calculate how much to charge the user`);
  }

  computeExactAmountToChargeLog(trackId: string, merchantId: string) {
    let args = {
      message: `Compute the exact amount to charge...`,
      '@timestamp': new Date(),
      trackId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'requestPayment()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    this.eventHelper.sendEvent(trackId, merchantId, `The response from billing is valid, so let's compute how much to charge the user...`);

  }

  cacheBillingResponseLog(billingResponse: BillingServiceCostResponseDto) {
    let args = {
      message: `Cache billing response to redis... ${JSON.stringify(billingResponse)}`,
      '@timestamp': new Date(),
      trackId: billingResponse['trackId'],
      type: AppConstants.REQUEST_TYPE,
      threadName: 'requestPayment()',
      eventId: '901',
    };
    LogHelper.logInfo(args);
  }

  sentPaymentRequestSuccessfully(trackId: string, merchantId: string, paymentRequest: PurchaseSMSDto) {
    let args = {
      message: `Sent payment request successfully, waiting for user confirmation... => ${JSON.stringify(paymentRequest)}`,
      '@timestamp': new Date(),
      trackId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'requestPayment()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    const metadata = { smsApi: { paymentStatus: 'PENDING' } };
    this.eventHelper.sendEvent(trackId, merchantId, `Requested payment of ${paymentRequest.amount} to BasePay successfully...`, metadata);
  }

  unableToSendPaymentRequestSuccessfully(trackId: string, merchantId: string, error: string) {
    let args = {
      message: `Unable to send payment request successfully, here is the error ==> ${JSON.stringify(error)}`,
      '@timestamp': new Date(),
      trackId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'requestPayment()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    const metadata = { smsApi: { paymentStatus: 'FAILED' } };
    this.eventHelper.sendEvent(trackId, merchantId, `Failed to request payment to BasePay, This is the reason: ==> ${JSON.stringify(error)}`, metadata);
  }

  errorOccuredLog(trackId: string, error, context: string) {
    let args = {
      message: `Error occured, context: ${context} ==> ${JSON.stringify(error.response.data)}`,
      '@timestamp': new Date(),
      trackId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'requestPayment()',
      eventId: '901',
    };
    LogHelper.logInfo(args);
  }

  paymentFailedLog(paymentResponse: PaymentResponseDto, billingResponse: BillingServiceCostResponseDto) {
    const trackId = billingResponse['trackId'];
    const merchantId = billingResponse['merchantId'];
    const billedPhoneNumber = billingResponse['phoneNumber'];
    let args = {
      message: `Payment failed...., here is the reason ==> ${JSON.stringify(paymentResponse)}`,
      '@timestamp': new Date(),
      trackId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'paymentCallback()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    // send status to status tracking topic
    const metadata = { smsApi: { paymentStatus: 'FAILED', amountPaid: 0, phoneNumber: billedPhoneNumber } };
    this.eventHelper.sendEvent(trackId, merchantId, `Payment failed...., here is the reason ==> ${JSON.stringify(paymentResponse)}`, metadata);
  }

  paymentSucceededLog(paymentResponse: PaymentResponseDto, billingResponse: BillingServiceCostResponseDto) {
    const trackId = billingResponse['trackId'];
    const merchantId = billingResponse['merchantId'];
    const billedPhoneNumber = billingResponse['phoneNumber'];

    let args = {
      message: `Payment succeeded.... ==> ${JSON.stringify(paymentResponse)}`,
      '@timestamp': new Date(),
      trackId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'paymentCallback()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    // send status to status tracking topic
    const metadata = { smsApi: { paymentStatus: 'SUCCESS', amountPaid: paymentResponse.collectedAmount, phoneNumber: billedPhoneNumber } };

    // event status tracking payload
    const paymentRequestStatus: StatusTrackingDto = {
      trackId,
      merchantId,
      message: '[SMS API] Payment done successfully!',
      timestamp: new Date(),
      metadata
    };

    paymentRequestStatus['transactionId'] = paymentResponse.merchantTransactionId;
    paymentRequestStatus['transactionType'] = 'Credit';
    this.kafkaHelper.send(trackId, paymentRequestStatus, 'requestStatusTracking', process.env.REQUEST_STATUS_TRACKING_TOPIC);
  }

  paymentDoneForSMSAllocationLog(trackId, merchantId, allocateSMSRequest: AdminSMSAllocationRequestDto) {
    // send status to status tracking topic
    const metadata = { smsApi: { paymentStatus: 'SUCCESS', amountPaid: allocateSMSRequest.amountPaid, phoneNumber: 'null' } };

    // event status tracking payload
    const paymentDoneStatus: StatusTrackingDto = {
      trackId,
      merchantId,
      message: '[SMS API] Payment done successfully!',
      timestamp: new Date(),
      metadata
    };

    paymentDoneStatus['transactionId'] = trackId;
    paymentDoneStatus['transactionType'] = 'Credit';
    this.kafkaHelper.send(trackId, paymentDoneStatus, 'requestStatusTracking', process.env.REQUEST_STATUS_TRACKING_TOPIC);
  }

  paymentCallbackResponseLog(billingResponse: BillingServiceCostResponseDto) {
    let args = {
      message: `Received a response from payment callback from BasePay and we've also immediately fetched the billing response from redis... ${JSON.stringify(billingResponse)}`,
      '@timestamp': new Date(),
      trackId: billingResponse['trackId'],
      type: AppConstants.REQUEST_TYPE,
      threadName: 'paymentCallback()',
      eventId: '901',
    };
    LogHelper.logInfo(args);
  }

  dispatchSMSAllocationLog(smsAllocation: SMSAllocationRequestDto) {
    let args = {
      message: `Dispatch/trigger SMS allocation command... ==> ${JSON.stringify(smsAllocation)}`,
      '@timestamp': new Date(),
      trackId: smsAllocation['trackId'],
      type: AppConstants.REQUEST_TYPE,
      threadName: 'paymentCallback()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    const metadata = { smsApi: { numberOfSMSAllocated: smsAllocation.amount } };
    this.eventHelper.sendEvent(smsAllocation['trackId'], smsAllocation.merchantId, `Request wallet service to allocate ${smsAllocation.amount} SMS...`, metadata);
  }

  adminDispatchSMSAllocationLog(merchantId: string, smsAllocation: SMSAllocationRequestDto) {
    let args = {
      message: `Dispatch/trigger SMS allocation command... ==> ${JSON.stringify(smsAllocation)}`,
      '@timestamp': new Date(),
      trackId: smsAllocation['trackId'],
      type: AppConstants.REQUEST_TYPE,
      threadName: 'paymentCallback()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    const metadata = { smsApi: { numberOfSMSAllocated: smsAllocation.amount } };
    this.eventHelper.sendEvent(smsAllocation['trackId'], merchantId, `Request wallet service to allocate ${smsAllocation.amount} SMS...`, metadata);
  }

  allocatedSMSSuccessfullyLog(trackId: string, smsAllocationResponse: SMSAllocationResponseDto) {
    let args = {
      message: `Allocated SMS Successfully... ==> ${JSON.stringify(smsAllocationResponse)}`,
      '@timestamp': new Date(),
      trackId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'paymentCallback()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    const metadata = { smsApi: { numberOfSMSAllocated: smsAllocationResponse['smsAllocated'], smsWalletBalance: smsAllocationResponse['smsBalance'] } };
    const adminMerchantId: string = smsAllocationResponse['metadata']['request']['metadata']['adminMerchantId'];

    // event status tracking payload
    const smsAllocationStatus: StatusTrackingDto = {
      trackId,
      merchantId: (adminMerchantId) ? adminMerchantId : smsAllocationResponse['metadata']['request']['merchantId'],
      message: '[SMS API] Allocated SMS Successfully!',
      timestamp: new Date(),
      metadata
    };

    smsAllocationStatus['transactionId'] = smsAllocationResponse['transactionId'];
    this.kafkaHelper.send(trackId, smsAllocationStatus, 'requestStatusTracking', process.env.REQUEST_STATUS_TRACKING_TOPIC);
  }

  failedSMSAllocationSuccessfullyLog(trackId: string, smsAllocationResponse: SMSAllocationResponseDto) {
    let args = {
      message: `Failed to allocate SMS... ==> ${JSON.stringify(smsAllocationResponse)}`,
      '@timestamp': new Date(),
      trackId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'paymentCallback()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    // const metadata = { smsApi: { numberOfSMSAllocated: smsAllocation.amount} };
    // this.eventHelper.sendEvent(smsAllocation.merchantId, `Request wallet service to allocate ${smsAllocation.amount} SMS...`, metadata);
  }

  emailSentSuccessfullyLog(trackId: string, merchantId: string) {
    let args = {
      message: `Sent email notification!`,
      '@timestamp': new Date(),
      trackId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'sendEmailNotification()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    this.eventHelper.sendEvent(trackId, merchantId, `Sent email notification!`);
  }

  failedToSendEmailLog(trackId: string, merchantId: string) {
    let args = {
      message: `Failed to send email notification`,
      '@timestamp': new Date(),
      trackId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'sendEmailNotification()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    this.eventHelper.sendEvent(trackId, merchantId, `Failed to send email notification`);
  }

  verifiedPaymentLog(trackId: string, merchantId: string) {
    let args = {
      message: `Verified payment successfully`,
      '@timestamp': new Date(),
      trackId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'verifyPayment()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    this.eventHelper.sendEvent(trackId, merchantId, args.message);
  }

  failedToverifyPaymentLog(trackId: string, merchantId: string, error) {
    let args = {
      message: `Payment verification failed: ${error}`,
      '@timestamp': new Date(),
      trackId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'verifyPayment()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    this.eventHelper.sendEvent(trackId, merchantId, args.message);
  }

  authenticateRequestLog(trackId: string, data) {
    let args = {
      message: `Send authentication request to ${data}`,
      '@timestamp': new Date(),
      trackId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'requestPayment()',
      eventId: '901',
    };
    LogHelper.logInfo(args);
  }

  getTokenLog(trackId: string) {
    let args = {
      message: `Get token from redis`,
      '@timestamp': new Date(),
      trackId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'requestPayment()',
      eventId: '901',
    };
    LogHelper.logInfo(args);
  }

  initiatePaymentLog(trackId: string, data, baseurl: string) {
    let args = {
      message: `Initiate payment request to ${baseurl}, request: ${JSON.stringify(data)}`,
      '@timestamp': new Date(),
      trackId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'requestPayment()',
      eventId: '901',
    };
    LogHelper.logInfo(args);
  }

  authenticateResponseLog(trackId: string) {
    let args = {
      message: `Received authentication response....}`,
      '@timestamp': new Date(),
      trackId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'requestPayment()',
      eventId: '901',
    };
    LogHelper.logInfo(args);
  }
}
