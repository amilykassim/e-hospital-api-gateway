import { Injectable } from "@nestjs/common";
import { CheckMyWalletSMSBalanceRequest } from "../dto/check-my-wallet-sms-balance.dto";
import { SMSDto } from "../dto/send-sms-request.dto";
import { SMSResponseDto } from "../dto/send-sms-response.dto";
import { SMSDeductionRequestDto } from "../dto/sms-deduction-request.dto";
import { SMSDeductionResponseDto } from "../dto/sms-deduction-response.dto";
import { WalletSMSBalanceRequestDto } from "../dto/wallet-sms-balance-request";
import { WalletSMSBalanceResponseDto } from "../dto/wallet-sms-balance-response";
import { EventHelper } from "../events/event-helper/event.helper";
import { AppConstants } from "./app.constants";
import { LogHelper } from "./log.helper";

/**
 *
 * @author amilykassim
 */

@Injectable()
export class SendSMSLog {
  constructor(
    private readonly eventHelper: EventHelper,
  ) { }

  checkWalletSMSBalanceLog(walletSMSBalance: WalletSMSBalanceRequestDto) {
    let args = {
      message: `Dispatch/trigger the check wallet SMS balance command... ==> ${JSON.stringify(walletSMSBalance)}`,
      '@timestamp': new Date(),
      trackId: walletSMSBalance['trackId'],
      type: AppConstants.REQUEST_TYPE,
      threadName: 'checkWalletSMSBalance()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    this.eventHelper.sendEvent(walletSMSBalance['trackId'], walletSMSBalance.merchantId, 'Asked wallet service to check current balance');
  }

  validSMSPayloadLog(sms: SMSDto) {
    let args = {
      trackId: sms.trackId,
      message: `Validated SMS payload successfully ==> ${JSON.stringify(sms)}`,
      '@timestamp': new Date(),
      traceId: sms.customerId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'ValidateSendSms()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    this.eventHelper.sendEvent(sms.trackId, sms.customerId, `Verified SMS payload to be sent!`, sms.metadata);
  }

  scheduleSMSLog(sms: SMSDto) {
    let args = {
      trackId: sms.trackId,
      message: `Sent schedule SMS request successfully to schedule SMS for ${sms.receivers.length} contacts ==> ${JSON.stringify(sms)}`,
      '@timestamp': new Date(),
      traceId: sms.customerId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'ValidateSendSms()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    this.eventHelper.sendEvent(sms.trackId, sms.customerId, `Sent schedule SMS request successfully`, sms.metadata);
  }

  invalidSMSPayloadLog(sms: SMSDto) {
    let args = {
      trackId: sms.trackId,
      message: `Invalid SMS payload ==> ${JSON.stringify(sms)}`,
      '@timestamp': new Date(),
      traceId: sms.customerId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'ValidateSendSms()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    this.eventHelper.sendEvent(sms.trackId, sms.customerId, `Invalid SMS payload ==> ${JSON.stringify(sms)}`);
  }

  receivedScheduleSMSLog(sms: SMSDto) {
    let args = {
      trackId: sms.trackId,
      message: `Received Scheduled SMS for ${sms.receivers.length} contacts ==> ${JSON.stringify(sms)}`,
      '@timestamp': new Date(),
      traceId: sms.customerId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'ValidateSendSms()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    this.eventHelper.sendEvent(sms.trackId, sms.customerId, args.message);
  }

  cacheSMSRequestLog(sms: SMSDto) {
    let args = {
      trackId: sms.trackId,
      message: `Cache SMS request to redis... ==> ${JSON.stringify(sms)}`,
      '@timestamp': new Date(),
      traceId: sms.customerId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'sendSms()',
      eventId: '901',
    };
    LogHelper.logInfo(args);
  }

  cacheCheckingSMSBalanceRequestLog(sms: CheckMyWalletSMSBalanceRequest) {
    let args = {
      message: `Cache SMS request for checking SMS balance to redis... ==> ${JSON.stringify(sms)}`,
      '@timestamp': new Date(),
      trackId: sms['trackId'],
      type: AppConstants.REQUEST_TYPE,
      threadName: 'checkMySMSBalance()',
      eventId: '901',
    };
    LogHelper.logInfo(args);
  }

  getCachedSMSRequestLog(sms: SMSDto) {
    let args = {
      trackId: sms.trackId,
      message: `Received a response from checking balance so let's Get cached SMS request from redis... ==> ${JSON.stringify(sms)}`,
      '@timestamp': new Date(),
      traceId: sms.customerId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'sendSms()',
      eventId: '901',
    };
    LogHelper.logInfo(args);
  }

  cacheSMSDeductionRequestLog(sms: SMSDeductionRequestDto) {
    let args = {
      trackId: sms['trackId'],
      message: `Cache SMS deduction request to redis... ==> ${JSON.stringify(sms)}`,
      '@timestamp': new Date(),
      traceId: sms.merchantId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'sendSms()',
      eventId: '901',
    };
    LogHelper.logInfo(args);
  }

  getCachedSMSDeductionRequestLog(sms: SMSDeductionRequestDto) {
    let args = {
      trackId: sms['trackId'],
      message: `Received a response regarding deducting SMS from wallet and we've also immediately fetched the cached SMS deduction request from redis...`,
      '@timestamp': new Date(),
      traceId: sms.merchantId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'sendSms()',
      eventId: '901',
    };
    LogHelper.logInfo(args);
  }

  receivedSMSBalanceLog(balanceResponse: WalletSMSBalanceResponseDto) {
    let args = {
      trackId: balanceResponse['trackId'],
      message: `Received SMS balance response from wallet`,
      '@timestamp': new Date(),
      traceId: balanceResponse['metadata']['request'].merchantId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'sendSms()',
      eventId: '901',
    };
    LogHelper.logInfo(args);
  }

  smsNeededLogForKonga(trackId) {
    let args = {
      trackId: trackId,
      message: `SMS needed is 0`,
      '@timestamp': new Date(),
      type: AppConstants.REQUEST_TYPE,
      threadName: 'sendSms()',
      eventId: '901',
    };
    LogHelper.logInfo(args);
  }

  smsToDeductLogForKonga(trackId) {
    let args = {
      trackId: trackId,
      message: `Number of SMS to deduct is 0`,
      '@timestamp': new Date(),
      type: AppConstants.REQUEST_TYPE,
      threadName: 'sendSms()',
      eventId: '901',
    };
    LogHelper.logInfo(args);
  }

  receivedSMSResponseFromMtnAgentLog(smsResponse: SMSResponseDto) {
    let args = {
      trackId: smsResponse.trackId,
      message: `Received SMS response from MTN agent`,
      '@timestamp': new Date(),
      traceId: smsResponse.customerId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'sendSms()',
      eventId: '901',
    };
    LogHelper.logInfo(args);
  }

  smsAlreadyBeingProcessed(sms: SMSDto) {
    let args = {
      message: `SMS Already being processed ==> ${JSON.stringify(sms)}`,
      '@timestamp': new Date(),
      trackId: sms.trackId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'getRequest()',
      eventId: '901',
    };
    LogHelper.logInfo(args);
  }

  walletBalanceAlreadyBeingProcessed(transactionId: string, sms: SMSDto) {
    let args = {
      message: `SMS balance with this transactionID already processed ==> ${JSON.stringify(sms)}`,
      '@timestamp': new Date(),
      trackId: sms.trackId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'getRequest()',
      eventId: '901',
    };
    LogHelper.logInfo(args);
  }

  receivedDeductionResponseLog(deductionResponse: SMSDeductionResponseDto) {
    let args = {
      trackId: deductionResponse['trackId'],
      message: `Received deduction response from sms wallet`,
      '@timestamp': new Date(),
      traceId: deductionResponse['metadata']['request'].merchantId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'sendSms()',
      eventId: '901',
    };
    LogHelper.logInfo(args);
  }

  checkWalletSMSBalanceOnlyLog(smsBalanceResponse: WalletSMSBalanceResponseDto) {
    const trackId = smsBalanceResponse['trackId'];
    const merchantId = smsBalanceResponse['metadata']['request']['merchantId'];
    let args = {
      trackId,
      message: `Your SMS balance is ${JSON.stringify(smsBalanceResponse.balance)} SMS...`,
      '@timestamp': new Date(),
      traceId: merchantId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'sendSms()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    const metadata = { smsApi: { smsBalance: smsBalanceResponse.balance } };
    this.eventHelper.sendEvent(trackId, merchantId, `Your SMS balance is ${smsBalanceResponse.balance} SMS...`, metadata);
  }

  checkIfUserHasEnoughSMSLog(sms: SMSDto, smsNeeded: number) {
    let args = {
      trackId: sms.trackId,
      message: `Check if user has enough SMS to send ${JSON.stringify(smsNeeded)} SMS...`,
      '@timestamp': new Date(),
      traceId: sms.customerId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'sendSms()',
      eventId: '901',
    };
    LogHelper.logInfo(args);
  }

  notEnoughSMSLog(sms: SMSDto, smsNeeded: number, errorMessage: string) {
    let args = {
      trackId: sms.trackId,
      message: `The user doesn't have enough SMS to send ${JSON.stringify(smsNeeded)} SMS...`,
      '@timestamp': new Date(),
      traceId: sms.customerId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'sendSms()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    this.eventHelper.sendEvent(sms.trackId, sms.customerId, errorMessage);
  }

  userHasEnoughSMSLog(sms: SMSDto, smsNeeded: number) {
    let args = {
      trackId: sms.trackId,
      message: `The user have enough SMS to send ${JSON.stringify(smsNeeded)} SMS...`,
      '@timestamp': new Date(),
      traceId: sms.customerId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'sendSms()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    this.eventHelper.sendEvent(sms.trackId, sms.customerId, `The user have enough SMS to send ${JSON.stringify(smsNeeded)} SMS...`);
  }

  mapSMSdtoToGWdtoLog(sms: SMSDto) {
    let args = {
      trackId: sms.trackId,
      message: `Map SMS DTO to Gateway DTO....`,
      '@timestamp': new Date(),
      traceId: sms.customerId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'sendSms()',
      eventId: '901',
    };
    LogHelper.logInfo(args);
  }

  sendSMSRequestLog(sms: SMSDto) {
    let args = {
      trackId: sms.trackId,
      message: `Dispatch/trigger the send SMS request command...`,
      '@timestamp': new Date(),
      traceId: sms.customerId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'sendSms()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    const metadata = { smsApi: { groupName: sms.contactListName, phoneNumber: sms.receivers } };
    this.eventHelper.sendEvent(sms.trackId, sms.customerId, `Send the SMS to sms gateway to route it to the telcos`, metadata);
  }

  sentSMSSuccessfullyLog(sms: SMSResponseDto) {
    let args = {
      trackId: sms.trackId,
      message: `Received a response from agent and the SMS is sent successfully...`,
      '@timestamp': new Date(),
      traceId: sms.customerId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'sendSms()',
      eventId: '901',
    };
    LogHelper.logInfo(args);
    this.eventHelper.sendEvent(sms.trackId, sms.customerId, `Received a response from agent and the SMS is sent successfully!`);
  }

  smsNotSentSuccessfullyLog(sms: SMSResponseDto) {
    let args = {
      trackId: sms.trackId,
      message: `Received a response from agent and the SMS is not sent successfully.....`,
      '@timestamp': new Date(),
      traceId: sms.customerId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'sendSms()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    this.eventHelper.sendEvent(sms.trackId, sms.customerId, `Received a response from agent and the SMS is not sent successfully :()`);
  }

  deductSMSLog(sms: SMSDeductionRequestDto) {
    let args = {
      trackId: sms['trackId'],
      message: `Dispatch/trigger SMS deduction command...`,
      '@timestamp': new Date(),
      traceId: sms.merchantId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'sendSms()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    this.eventHelper.sendEvent(sms['trackId'], sms.merchantId, `Ask wallet service to deduct SMS`);
  }

  SMSDeductedSuccessfullyLog(sms: SMSDeductionRequestDto, smsDeduction: SMSDeductionResponseDto) {
    let args = {
      trackId: sms['trackId'],
      message: `Deducted SMS successfully...`,
      '@timestamp': new Date(),
      traceId: sms.merchantId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'sendSms()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    const metadata = { smsApi: { smsBalance: smsDeduction.smsBalance } };
    this.eventHelper.sendEvent(sms['trackId'], sms.merchantId, `Deducted SMS successfully`, metadata);
  }

  SMSNotDeductedSMSLog(sms: SMSDeductionRequestDto, smsDeduction: SMSDeductionResponseDto) {
    let args = {
      trackId: sms['trackId'],
      message: `Failed to deduct SMS, and the reason is: ${smsDeduction.description}, ==> ${JSON.stringify(smsDeduction)}`,
      '@timestamp': new Date(),
      traceId: sms.merchantId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'sendSms()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    this.eventHelper.sendEvent(sms['trackId'], sms.merchantId, `Failed to deduct SMS`);
  }


  sentCallbackResponseLog(sms, payload, callbackUrl) {
    let args = {
      trackId: sms['trackId'],
      message: `Sent callback response to ${callbackUrl}, here is the object: ${JSON.stringify(payload)} `,
      '@timestamp': new Date(),
      type: AppConstants.REQUEST_TYPE,
      threadName: 'sendSms()',
      eventId: '901',
    };
    LogHelper.logInfo(args);
  }

  requestCallbackResponseLog(sms, payload, callbackUrl) {
    let args = {
      trackId: sms['trackId'],
      message: `response from ${callbackUrl}, is: ${JSON.stringify(payload)} `,
      '@timestamp': new Date(),
      type: AppConstants.REQUEST_TYPE,
      threadName: 'sendSms()',
      eventId: '901',
    };
    LogHelper.logInfo(args);
  }

  failedToSendCallbackResponseLog(sms, error) {
    let args = {
      trackId: sms['trackId'],
      message: `failed to send callback, here is the error: ${error}`,
      '@timestamp': new Date(),
      type: AppConstants.REQUEST_TYPE,
      threadName: 'sendSms()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    args.message = `failed to send callback, here is the error: ${JSON.stringify(error)}`;
    LogHelper.logInfo(args);
  }

  failedToAcknowledgeCallbackResponseLog(sms, data) {
    let args = {
      trackId: sms['trackId'],
      message: `failed to acknowledge the response, here is why : ${JSON.stringify(data)}`,
      '@timestamp': new Date(),
      type: AppConstants.REQUEST_TYPE,
      threadName: 'sendSms()',
      eventId: '901',
    };
    LogHelper.logInfo(args);
  }
}
