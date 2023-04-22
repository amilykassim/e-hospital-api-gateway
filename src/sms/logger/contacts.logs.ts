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
export class ContactsLog {
  constructor(
    private readonly eventHelper: EventHelper,
  ) { }

  invalidRequestLog(request) {
    let args = {
      message: `Invalid request... ==> ${JSON.stringify(request)}`,
      '@timestamp': new Date(),
      trackId: request['trackId'],
      type: AppConstants.REQUEST_TYPE,
      threadName: 'validateContacts()',
      eventId: '901',
    }
    LogHelper.logInfo(args);
  }

  forwardRequestLog(request, message: string) {
    let args = {
      message: `Forward the request to ${message} to sms contacts service`,
      '@timestamp': new Date(),
      trackId: request['trackId'],
      type: AppConstants.REQUEST_TYPE,
      threadName: 'validateContacts()',
      eventId: '901',
    }
    LogHelper.logInfo(args);
  }

  receivedResponseForValidateContactsLog(response, message: string) {
    let args = {
      message: `Received response for ${message}: ${JSON.stringify(response)}`,
      '@timestamp': new Date(),
      trackId: response['trackId'],
      type: AppConstants.REQUEST_TYPE,
      threadName: 'validateContacts()',
      eventId: '901',
    }
    LogHelper.logInfo(args);
  }
}
