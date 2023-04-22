import { LogHelper } from './../logger/log.helper';
import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SendSMSCommand, SMSDeductionCommand, WalletSMSBalanceCommand } from '../commands/implementation';
import { SMSDto } from '../dto/send-sms-request.dto';
import { SMSGwDto } from '../dto/sms-gw.dto';
import { ErrorResponse } from '../helpers/error-response.helper';
import { SendSmsHelper } from '../helpers/send-sms.helper';
import { SMSService } from '../sms.service';
import { ValidateSendSms } from '../validation/send-sms.validation';
import { MessagePattern, Payload } from '@nestjs/microservices/decorators';
import { WalletSMSBalanceRequestDto } from '../dto/wallet-sms-balance-request';
import { v4 as uuidv4 } from 'uuid';
import { WalletSMSBalanceResponseDto } from '../dto/wallet-sms-balance-response';
import { AuthenticatedUser, RoleMatchingMode, Roles, Unprotected } from 'nest-keycloak-connect';
import { AuthenticatedUserDto } from '../dto/authenticated-user.dto';
import { SMSDeductionRequestDto } from '../dto/sms-deduction-request.dto';
import { SMSResponseDto } from '../dto/send-sms-response.dto';
import { SMSDeductionResponseDto } from '../dto/sms-deduction-response.dto';
import { SendSMSLog } from '../logger/send-sms.logs';
import { MyCustomResponse } from '../helpers/success-response.helper';
import { EventHelper } from '../events/event-helper/event.helper';
import axios from 'axios';
import { ValidateSendSmsToAllContacts } from '../validation/send-sms-to-all-contacts.validation';
import { ContactsService } from '../services/contacts.service';
import { ValidateSendSmsToGroups } from '../validation/send-sms-to-groups.validation';
import { KafkaHelper } from '../utils/kafka-helper';
import { RedisHelper } from '../utils/redis-helper';
import { AppConstants } from '../logger/app.constants';

@Controller('/api/v1')
export class SendSMSController {
  constructor(
    private readonly smsService: SMSService,
    private readonly commandBus: CommandBus,
    private readonly sendSMSLog: SendSMSLog,
    private readonly customResponse: MyCustomResponse,
    private readonly eventHelper: EventHelper,
    private readonly contactsService: ContactsService,
    private readonly kafkaHelper: KafkaHelper,
    private readonly redisHelper: RedisHelper,
  ) { }

  @Get('/health')
  @Unprotected()
  checkIfAppIsRunning(): string {
    return this.smsService.isItRunning();
  }

  @Post('/sms/send')
  @Roles({ roles: ['user'], mode: RoleMatchingMode.ANY })
  async sendSms(@AuthenticatedUser() user: AuthenticatedUserDto, @Body(ValidateSendSms) sms: SMSDto, @Res() res) {
    // Set the customer ID and the tracking ID
    sms.customerId = user.customer_id;
    sms.trackId = uuidv4();

    // if no callback provided in the payload, use the one in the token
    if (!sms.callbackUrl)
      sms.callbackUrl = user.callbackUrl;

    // Validate send sms request payload with the help of validation pipeline
    if (sms != undefined && sms['error']) {
      this.sendSMSLog.invalidSMSPayloadLog(sms);
      return res.status(400).json(new ErrorResponse(sms['error']));
    }

    // if customer is <> then route sms for sms duplication check
    if (sms.customerId == process.env.JAIZ_BANK_CUSTOMER_ID) {
      await this.kafkaHelper.send(sms.trackId, { sms, user }, 'checkDuplicate', process.env.SMS_DUPLICATE_VALIDATOR_REQUEST_TOPIC);

      return res.status(200).json(this.customResponse.success(sms.trackId, sms.customerId));
    }

    // Send to SMS Scheduler service if SMS has to be scheduled
    if (sms.cron) {
      await this.kafkaHelper.send(sms.trackId, { sms, user }, 'scheduleSMS', process.env.SCHEDULE_SMS_REQUEST_TOPIC);
      this.sendSMSLog.scheduleSMSLog(sms);

      return res.status(200).json({ statusCode: 200, message: 'Request received successfully', trackId: sms.trackId });
    }

    // If it reaches here, then means the payload is valid
    sms.metadata = { smsApi: { campaignId: uuidv4(), launcherPhoneNumber: user.phone_number } } // add launcher phone number as metadata
    this.sendSMSLog.validSMSPayloadLog(sms);

    // Check sms balance
    const smsBalanceRequest: WalletSMSBalanceRequestDto = {
      merchantId: sms.customerId,
      transactionId: uuidv4(),
    };
    smsBalanceRequest['trackId'] = sms.trackId; // add track Id
    smsBalanceRequest['metadata'] = {
      request: sms,
      userInfo: {
        name: user['preferred_username'],
        email: user.email,
        roles: user.resource_access['sms-api'].roles
      }
    };

    // Dispatch checking sms balance command
    this.sendSMSLog.checkWalletSMSBalanceLog(smsBalanceRequest);
    await this.commandBus.execute(new WalletSMSBalanceCommand(smsBalanceRequest));

    // return an acknowlegement to the user that the sms request was accepted and is being processed
    return res.status(200).json(this.customResponse.success(sms.trackId, sms.customerId));

  }

  @MessagePattern(process.env.SCHEDULE_SMS_RESPONSE_TOPIC)
  async listenForScheduledSms(@Payload() { value }) {
    const user: AuthenticatedUserDto = value.user;
    const sms: SMSDto = value.sms;
    this.sendSMSLog.receivedScheduleSMSLog(sms);

    // Validate send sms request payload with the help of validation pipeline
    if (sms != undefined && sms['error']) return this.sendSMSLog.invalidSMSPayloadLog(sms);

    // If it reaches here, then means the payload is valid
    sms.metadata = { smsApi: { campaignId: uuidv4(), launcherPhoneNumber: user.phone_number } } // add launcher phone number as metadata
    this.sendSMSLog.validSMSPayloadLog(sms);

    // Check sms balance
    const smsBalanceRequest: WalletSMSBalanceRequestDto = {
      merchantId: sms.customerId,
      transactionId: uuidv4(),
    };
    smsBalanceRequest['trackId'] = sms.trackId; // add track Id
    smsBalanceRequest['metadata'] = { request: sms, userInfo: { name: user['preferred_username'], email: user.email } };

    // Dispatch checking sms balance command
    this.sendSMSLog.checkWalletSMSBalanceLog(smsBalanceRequest);
    await this.commandBus.execute(new WalletSMSBalanceCommand(smsBalanceRequest));
  }

  @Post('/sms/send/allContacts')
  @Roles({ roles: ['user'], mode: RoleMatchingMode.ANY })
  async sendSmsToAllContacts(@AuthenticatedUser() user: AuthenticatedUserDto, @Body(ValidateSendSmsToAllContacts) sms: SMSDto, @Res() res) {
    // Set the customer ID and the tracking ID
    sms.customerId = user.customer_id;
    sms.trackId = uuidv4();

    // if no callback provided in the payload, use the one in the token
    if (!sms.callbackUrl)
      sms.callbackUrl = user.callbackUrl;

    // Validate send sms request payload with the help of validation pipeline
    if (sms != undefined && sms['error']) {
      this.sendSMSLog.invalidSMSPayloadLog(sms);
      return res.status(400).json(new ErrorResponse(sms['error']));
    }

    // Send to SMS Scheduler service if SMS has to be scheduled
    if (sms.cron) {
      // Get all contacts
      const contacts: any = await this.contactsService.getContacts(sms);
      if (contacts.length < 1) return res.status(404).json({ statusCode: 404, error: 'No contacts found' });
      sms.receivers = contacts;

      await this.kafkaHelper.send(sms.trackId, { sms, user }, 'scheduleSMS', process.env.SCHEDULE_SMS_REQUEST_TOPIC);
      this.sendSMSLog.scheduleSMSLog(sms);

      return res.status(200).json({ statusCode: 200, message: 'Request received successfully', trackId: sms.trackId });
    }

    // If it reaches here, then means the payload is valid
    sms.metadata = { smsApi: { campaignId: uuidv4(), launcherPhoneNumber: user.phone_number } } // add launcher phone number as metadata
    this.sendSMSLog.validSMSPayloadLog(sms);

    // Get all contacts
    const contacts: any = await this.contactsService.getContacts(sms);
    if (contacts.length < 1) return res.status(404).json({ statusCode: 404, error: 'No contacts found' });
    sms.receivers = contacts;

    // Check sms balance
    const smsBalanceRequest: WalletSMSBalanceRequestDto = {
      merchantId: sms.customerId,
      transactionId: uuidv4(),
    };
    smsBalanceRequest['trackId'] = sms.trackId; // add track Id
    smsBalanceRequest['metadata'] = { request: sms, userInfo: { name: user['preferred_username'], email: user.email } };

    // Dispatch checking sms balance command
    this.sendSMSLog.checkWalletSMSBalanceLog(smsBalanceRequest);
    await this.commandBus.execute(new WalletSMSBalanceCommand(smsBalanceRequest));

    // return an acknowlegement to the user that the sms request was accepted and is being processed
    return res.status(200).json(this.customResponse.success(sms.trackId, sms.customerId));
  }

  @Post('/sms/send/groups')
  @Roles({ roles: ['user'], mode: RoleMatchingMode.ANY })
  async sendSmsToGroups(@AuthenticatedUser() user: AuthenticatedUserDto, @Body(ValidateSendSmsToGroups) sms: SMSDto, @Res() res) {
    // Set the customer ID and the tracking ID
    sms.customerId = user.customer_id;
    sms.trackId = uuidv4();

    // if no callback provided in the payload, use the one in the token
    if (!sms.callbackUrl)
      sms.callbackUrl = user.callbackUrl;

    // Validate send sms request payload with the help of validation pipeline
    if (sms != undefined && sms['error']) {
      this.sendSMSLog.invalidSMSPayloadLog(sms);
      return res.status(400).json(new ErrorResponse(sms['error']));
    }

    // Send to SMS Scheduler service if SMS has to be scheduled
    if (sms.cron) {
      // Get all contacts
      const contacts = await this.contactsService.getContactsByGroupId(sms);
      if (contacts.length < 1) return res.status(404).json({ statusCode: 404, error: 'No contacts found' });
      sms.receivers = contacts;

      await this.kafkaHelper.send(sms.trackId, { sms, user }, 'scheduleSMS', process.env.SCHEDULE_SMS_REQUEST_TOPIC);
      this.sendSMSLog.scheduleSMSLog(sms);

      return res.status(200).json({ statusCode: 200, message: 'Request received successfully', trackId: sms.trackId });
    }

    // If it reaches here, then means the payload is valid
    sms.metadata = { smsApi: { campaignId: uuidv4(), launcherPhoneNumber: user.phone_number } } // add launcher phone number as metadata
    this.sendSMSLog.validSMSPayloadLog(sms);

    // Get all contacts
    const contacts = await this.contactsService.getContactsByGroupId(sms);
    if (contacts.length < 1) return res.status(404).json({ statusCode: 404, error: 'No contacts found' });
    sms.receivers = contacts;

    // Check sms balance
    const smsBalanceRequest: WalletSMSBalanceRequestDto = {
      merchantId: sms.customerId,
      transactionId: uuidv4(),
    };
    smsBalanceRequest['trackId'] = sms.trackId; // add track Id
    smsBalanceRequest['metadata'] = { request: sms, userInfo: { name: user['preferred_username'], email: user.email } };

    // Dispatch checking sms balance command
    this.sendSMSLog.checkWalletSMSBalanceLog(smsBalanceRequest);
    await this.commandBus.execute(new WalletSMSBalanceCommand(smsBalanceRequest));

    // return an acknowlegement to the user that the sms request was accepted and is being processed
    return res.status(200).json(this.customResponse.success(sms.trackId, sms.customerId));
  }

  @MessagePattern(process.env.WALLET_SMS_BALANCE_RESPONSE_TOPIC)
  async listenForSMSBalanceResponse(@Payload() payload) {
    const smsBalanceResponse: WalletSMSBalanceResponseDto = payload.value;

    const isFound = await this.redisHelper.getAndDel(`${AppConstants.SMS_PROCESSED_API_WALLET_BALANCE_RESPONSE}-${smsBalanceResponse.transactionId}`);
    if (isFound) return this.sendSMSLog.walletBalanceAlreadyBeingProcessed(smsBalanceResponse.transactionId, smsBalanceResponse['metadata']['request']);

    await this.redisHelper.set(`${AppConstants.SMS_PROCESSED_API_WALLET_BALANCE_RESPONSE}-${smsBalanceResponse.transactionId}`, { transactionId: smsBalanceResponse.transactionId });
    this.sendSMSLog.receivedSMSBalanceLog(payload.value);

    const isOnlyCheckSMSWalletBalance = smsBalanceResponse['metadata']['request']['onlyCheckSMSWalletBalance'];

    // Check if the response is for only checking my SMS wallet balance or sending SMS.
    if (isOnlyCheckSMSWalletBalance === true) {
      this.sendSMSLog.checkWalletSMSBalanceOnlyLog(smsBalanceResponse);

      // End the program since the request was only for checking the SMS balance.
      return;
    }

    // if it reaches here it means the response is for sending SMS.
    let sms: SMSDto = smsBalanceResponse['metadata']['request']['metadata']['request'];

    // Check if user has enough sms to perform the action of sending sms
    // 1) First count number of SMS according to the number of message characters. P.S (160 characters equals 1 SMS) 
    const smsCount = Math.ceil(sms.message.length / 160);
    sms.metadata['numberOfSmsToDeduct'] = smsCount;
    sms.metadata['callbackUrl'] = sms['callbackUrl'];
    sms.metadata['roles'] = smsBalanceResponse['metadata'].request.metadata.userInfo.roles;

    // 2) Multiply it to the number of receivers to get SMSs that are needed to be sent.
    let smsNeeded = sms.receivers.length * smsCount;

    // TODO (delete it later):
    // check if customer id matches KongaPay id
    if (sms.customerId === process.env.KONGA_PAY_CUSTOMER_ID) {
      smsNeeded = SendSmsHelper.calculateHowManySmsNeededForKongaPay(sms, smsCount);
      if (smsNeeded === 0) return this.sendSMSLog.smsNeededLogForKonga(sms.trackId);
    }

    // Check if user has enough balance
    this.sendSMSLog.checkIfUserHasEnoughSMSLog(sms, smsNeeded);
    if (smsBalanceResponse.balance < smsNeeded) {
      const errorMessage = `
      The user doesn't have enough SMS to send ${smsNeeded} SMS, 
      current balance is ${smsBalanceResponse.balance} and he/she needs
      to purchase ${smsNeeded - smsBalanceResponse.balance} SMSs more to complete the action`;
      this.sendSMSLog.notEnoughSMSLog(sms, smsNeeded, errorMessage);
      return errorMessage;
    }

    // If it reaches here, then the user has enough SMS to send the SMS he needs.
    this.sendSMSLog.userHasEnoughSMSLog(sms, smsNeeded);

    // Send SMS
    // 1) Map sms dto to sms gw dto (this will be removed once all of the microservice have the same sms DTOs)
    this.sendSMSLog.mapSMSdtoToGWdtoLog(sms);
    const smsToBeSentToGW: SMSGwDto = SendSmsHelper.mapSmsDtoToSmsGwDto(sms);

    // 2) Dispatch the sms request command
    this.sendSMSLog.sendSMSRequestLog(sms);
    await this.commandBus.execute(new SendSMSCommand(smsToBeSentToGW));

    // Source activity events
    const event = {
      verb: "sent",
      customerid: sms.customerId,
      indirectObject: `to ${sms.receivers.length} recipients`,
      directObject: "a campaign",
      eventType: "CAMPAIGN",
      category: "SMS",
      username: smsBalanceResponse['metadata']['request']['metadata']['userInfo']['name'],
      timestamp: new Date()
    }
    this.eventHelper.sendActivityEvents(sms.trackId, event);
  }

  @MessagePattern(process.env.SMS_AGENT_RESPONSE_TOPIC)
  async listenSMSAgentResponse(@Payload() payload) {
    let smsResponse: SMSResponseDto = payload.value;
    const request: SMSDto = smsResponse['request'];
    const sms = request;

    const isFound = await this.redisHelper.getAndDel(`${AppConstants.SMS_PROCESSED_API_DEDUCTION_REQUEST}-${sms.metadata['smsGw']['campaignId']}-${sms['receiver']}`);
    if (isFound) return this.sendSMSLog.smsAlreadyBeingProcessed(sms);

    // if sms sent successfully then add it to already processed SMS
    if (parseInt(smsResponse['code']) === 200) await this.redisHelper.set(`${AppConstants.SMS_PROCESSED_API_DEDUCTION_REQUEST}-${sms.metadata['smsGw']['campaignId']}-${sms['receiver']}`, sms);

    this.sendSMSLog.receivedSMSResponseFromMtnAgentLog(payload.value);

    await this.deductSMS(smsResponse);

    request['merchantId'] = request.customerId;
    delete request.customerId;
    await this.sendCallback(smsResponse, request, smsResponse.metadata['telco']);
  }

  async deductSMS(smsResponse: SMSResponseDto) {
    // Unable to send sms
    if (parseInt(smsResponse['code']) === 200) {
      // If it reaches here, it means the SMS was sent successfully
      this.sendSMSLog.sentSMSSuccessfullyLog(smsResponse);

      // Create deduction SMS object
      const smsDeduction: SMSDeductionRequestDto = {
        merchantId: smsResponse.customerId,
        amount: smsResponse.metadata['numberOfSmsToDeduct'],
        transactionId: uuidv4()
      };
      smsDeduction['trackId'] = smsResponse.trackId; // add track ID

      // TODO: DELETE THIS LATER
      if (smsDeduction.merchantId === process.env.KONGA_PAY_CUSTOMER_ID) {
        smsDeduction.amount = SendSmsHelper.calculateSmsToDeductForKongaPay(smsResponse['request']);
        if (smsDeduction.amount === 0) return this.sendSMSLog.smsToDeductLogForKonga(smsResponse.trackId);
      }

      // Deduct SMS if SMS was sent successfully
      this.sendSMSLog.deductSMSLog(smsDeduction);
      await this.commandBus.execute(new SMSDeductionCommand(smsDeduction));

    } else return this.sendSMSLog.smsNotSentSuccessfullyLog(smsResponse);
  }

  async sendCallback(smsResponse: SMSResponseDto, request, telco: string) {
    try {
      const callbackUrl = smsResponse.metadata['callbackUrl'];

      // dismiss sending callback, if no callback url provided
      if (!callbackUrl) return;

      const payload = {
        statusCode: (smsResponse['code'] == 200) ? 200 : 503,
        status: (smsResponse['code'] == '200') ? 'SUCCESS' : 'FAILED',
        trackId: smsResponse.trackId,
        title: request['sender'],
        message: request.message,
        recipient: request['receiver'],
        telco,
        failureReason: smsResponse['error']
      };
      const { data } = await axios.post(callbackUrl, payload);

      if (data.statusCode !== 200) return this.sendSMSLog.failedToAcknowledgeCallbackResponseLog(request, data);

      this.sendSMSLog.sentCallbackResponseLog(request, payload, callbackUrl);
    } catch (error) {
      return this.sendSMSLog.failedToSendCallbackResponseLog(request, error);
    }
  }

  @MessagePattern(process.env.WALLET_SMS_DEDUCT_RESPONSE_TOPIC)
  async listenToSMSDeductionResponse(@Payload() payload) {
    this.sendSMSLog.receivedDeductionResponseLog(payload.value);

    const smsDeduction: SMSDeductionResponseDto = payload.value;
    const smsDeductionRequest: SMSDeductionRequestDto = smsDeduction['metadata']['request'];

    // deducted sms successfully
    if (smsDeduction.status === 'SUCCESS') {
      return this.sendSMSLog.SMSDeductedSuccessfullyLog(smsDeductionRequest, smsDeduction);
    }

    // if it reaches here, then it indicates that SMS was not deducted successfully
    return this.sendSMSLog.SMSNotDeductedSMSLog(smsDeductionRequest, smsDeduction);
  }

  @MessagePattern(process.env.SMS_AGENT_INCOMING_SMS_CALLBACK_REQUEST_TOPIC)
  async listenToIncomingSMSCallbackRequest(@Payload() { value }) {
    const sms = value;

    // Send request
    try {
      this.sendSMSLog.sentCallbackResponseLog(sms, value, process.env.INCOMING_SMS_CALLBACK_URL);
      const { data } = await axios.post(process.env.INCOMING_SMS_CALLBACK_URL, value);

      if (data.statusCode === 200) return this.sendSMSLog.requestCallbackResponseLog(sms, data, process.env.INCOMING_SMS_CALLBACK_URL);

      this.sendSMSLog.failedToSendCallbackResponseLog(sms, data);

    } catch (error) {
      this.sendSMSLog.failedToSendCallbackResponseLog(sms, error);
    }
  }

  @MessagePattern(process.env.SMS_DUPLICATE_VALIDATOR_RESPONSE_TOPIC)
  async listenToSmsDuplicateValidatorResponse(@Payload() payload) {
    const { sms, user } = payload.value;

    console.log('\n\n\n>>>>> listening here..');

    // If it reaches here, then means the payload is valid
    sms.metadata = { smsApi: { campaignId: uuidv4(), launcherPhoneNumber: user.phone_number } } // add launcher phone number as metadata
    this.sendSMSLog.validSMSPayloadLog(sms);

    // Check sms balance
    const smsBalanceRequest: WalletSMSBalanceRequestDto = {
      merchantId: sms.customerId,
      transactionId: uuidv4(),
    };
    smsBalanceRequest['trackId'] = sms.trackId; // add track Id
    smsBalanceRequest['metadata'] = {
      request: sms,
      userInfo: {
        name: user['preferred_username'],
        email: user.email,
        roles: user.resource_access['sms-api'].roles
      }
    };

    // Dispatch checking sms balance command
    this.sendSMSLog.checkWalletSMSBalanceLog(smsBalanceRequest);
    await this.commandBus.execute(new WalletSMSBalanceCommand(smsBalanceRequest));
  }
}
