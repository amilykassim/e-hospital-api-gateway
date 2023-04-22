import { Injectable } from "@nestjs/common";
import { BillingSubscriptionRequestDto } from "../dto/billing-subscription-request.dto";
import { WalletCreationRequestDto } from "../dto/wallet-creation-request.dto";
import { WalletCreationResponseDto } from "../dto/wallet-creation-response.dto";
import { EventHelper } from "../events/event-helper/event.helper";
import { AppConstants } from "./app.constants";
import { LogHelper } from "./log.helper";

/**
 *
 * @author amilykassim
 */

@Injectable()
export class WalletCreationLog {
  constructor(
    private readonly eventHelper: EventHelper,
  ) { }

  validWalletPayloadLog(wallet: WalletCreationRequestDto) {
    let args = {
      message: `Validated Wallet request payload successfully... ==> ${JSON.stringify(wallet)}`,
      '@timestamp': new Date(),
      trackId: wallet['trackId'],
      type: AppConstants.REQUEST_TYPE,
      threadName: 'ValidateWalletCreation()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    this.eventHelper.sendEvent(wallet['trackId'], wallet.ownerId, 'Verified create wallet request payload!');
  }

  invalidWalletPayloadLog(wallet: WalletCreationRequestDto) {
    let args = {
      message: `Invalid Wallet request payload... ==> ${wallet['error']}`,
      '@timestamp': new Date(),
      trackId: wallet['trackId'],
      type: AppConstants.REQUEST_TYPE,
      threadName: 'ValidateWalletCreation()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    this.eventHelper.sendEvent(wallet['trackId'], wallet.ownerId, `Invalid Wallet request payload, this is why: ${wallet['error']}`);
  }

  setBillingSubscriptionLog(billingSubscription: BillingSubscriptionRequestDto, wallet: WalletCreationRequestDto) {
    let args = {
      message: `Dispatch/trigger billing subscription command... ==> ${JSON.stringify(billingSubscription)}`,
      '@timestamp': new Date(),
      trackId: wallet['trackId'],
      type: AppConstants.REQUEST_TYPE,
      threadName: 'setSubscriptionPayment()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    const metadata = { smsApi: { ownerName: wallet.ownerName } };
    this.eventHelper.sendEvent(wallet['trackId'], billingSubscription.merchantId, `Ask billing service to set subscription for ${wallet.ownerName}`, metadata);
  }

  setCreateWalletLog(wallet: WalletCreationRequestDto) {
    let args = {
      message: `Dispatch/trigger create wallet command... ==> ${JSON.stringify(wallet)}`,
      '@timestamp': new Date(),
      trackId: wallet['trackId'],
      type: AppConstants.REQUEST_TYPE,
      threadName: 'createWallet()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    const metadata = { smsApi: { ownerName: wallet.ownerName } };
    this.eventHelper.sendEvent(wallet['trackId'], wallet.ownerId, `Asked wallet service to create a wallet for ${wallet.ownerName}`, metadata);
  }

  unableToSetBillingSubscriptionLog(error: string) {
    let args = {
      message: `Unable to set subscription payment... here is the error ==> ${error}`,
      '@timestamp': new Date(),
      traceId: '',
      type: AppConstants.REQUEST_TYPE,
      threadName: 'setSubscriptionPayment()',
      eventId: '901',
    };
    LogHelper.logInfo(args);
  }

  setBillingSubscriptionSuccessfullyLog() {
    let args = {
      message: `The subscription payment is set successfully...`,
      '@timestamp': new Date(),
      traceId: '',
      type: AppConstants.REQUEST_TYPE,
      threadName: 'setSubscriptionPayment()',
      eventId: '901',
    };
    LogHelper.logInfo(args);
  }

  createWalletSuccessfullyLog(wallet: WalletCreationResponseDto) {
    let args = {
      message: `Created wallet successfully... ==> ${JSON.stringify(wallet)}`,
      '@timestamp': new Date(),
      trackId: wallet['trackId'],
      type: AppConstants.REQUEST_TYPE,
      threadName: 'createWallet()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    const metadata = { smsApi: { registered: 'TRUE' } };
    this.eventHelper.sendEvent(wallet['trackId'], wallet.merchantId, `Created wallet successfully!`, metadata);
  }

  unableToCreateWalletLog(wallet: WalletCreationResponseDto) {
    const message = `Unable to create wallet... ==> ${JSON.stringify(wallet)}`;
    let args = {
      message,
      '@timestamp': new Date(),
      trackId: wallet['trackId'],
      type: AppConstants.REQUEST_TYPE,
      threadName: 'createWallet()',
      eventId: '901',
    };
    LogHelper.logInfo(args);

    const metadata = { smsApi: { registered: 'FALSE' } };
    this.eventHelper.sendEvent(wallet['trackId'], wallet.merchantId, message, metadata);
  }
}
