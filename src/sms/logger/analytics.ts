import { Injectable } from "@nestjs/common";
import { EventHelper } from "../events/event-helper/event.helper";
import { AppConstants } from "./app.constants";
import { LogHelper } from "./log.helper";

/**
 *
 * @author amilykassim
 */

@Injectable()
export class AnalyticsLog {
  constructor(
    private readonly eventHelper: EventHelper,
  ) { }

  checkWalletSMSBalance(trackId: string, customerId: string) {
    let args = {
      message: `Ask Analytics API to get current SMS balance for customer id: ==> ${customerId}`,
      '@timestamp': new Date(),
      traceId: customerId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'checkWalletSMSBalance()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    this.eventHelper.sendEvent(trackId, customerId, 'Asked analytics API to get current balance');
  }

  walletSMSBalanceLog(trackId: string, customerId: string, balance: number) {
    let args = {
      message: `Current SMS balance for customer id: ==> ${customerId} is ${balance}`,
      '@timestamp': new Date(),
      traceId: customerId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'checkWalletSMSBalance()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    this.eventHelper.sendEvent(trackId, customerId, `Current SMS balance for customer id: ==> ${customerId} is ${balance}`,);
  }

  invalidWalletSMSBalanceLog(trackId: string, customerId: string, data: any) {
    let args = {
      message: `Received no SMS balance for customer ID: ==> ${customerId}, data received is: ${JSON.stringify(data)}`,
      '@timestamp': new Date(),
      traceId: customerId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'checkWalletSMSBalance()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    this.eventHelper.sendEvent(trackId, customerId, `Received no SMS balance for customer ID: ==> ${customerId}, data received is: ${JSON.stringify(data)}`,);
  }
}
