import { AppConstants } from './../logger/app.constants';
import { SMSAllocationRequestDto } from "../dto/sms-allocation-request.dto";
import { v4 as uuidv4 } from 'uuid';
import { Injectable } from "@nestjs/common";
import { VerifyPaymentRequestDto } from "../dto/verify-payment-request.dto";
import { BillingServiceCostRequestDto } from "../dto/billing-service-cost-request.dto";
import { EventHelper } from "../events/event-helper/event.helper";
const Flutterwave = require('flutterwave-node-v3');
import axios from 'axios';
import { RedisHelper } from "../utils/redis-helper";
import { PurchaseSMSLog } from '../logger/purchase-sms.logs';
const qs = require('qs');

@Injectable()
export class PurchaseSMSHelper {
  constructor(
    private readonly eventHelper: EventHelper,
    private readonly redis: RedisHelper,
    private readonly purchaseSMSLog: PurchaseSMSLog,
  ) { }

  getSMSAllocationPayload(trackId: string, merchantId: string, amount: number, email: string, adminMerchantId?: string) {
    const smsAllocationPayload: SMSAllocationRequestDto = {
      merchantId: merchantId,
      amount: amount,
      description: 'SMS Allocation',
      transactionId: uuidv4()
    };

    smsAllocationPayload['trackId'] = trackId;
    smsAllocationPayload['metadata'] = { email: email, adminMerchantId };

    return smsAllocationPayload;
  }

  sendPurchaseActivityEvent(trackId: string, merchantId: string, amount: number, username: string) {
    const event = {
      verb: "purchased",
      customerid: merchantId,
      indirectObject: '',
      directObject: `${amount} SMS`,
      eventType: "PURCHASE",
      category: "PURCHASE",
      username,
      timestamp: new Date()
    }

    this.eventHelper.sendActivityEvents(trackId, event);
  }

  getBillingServiceCostPayload(trackId: string, merchantId: string, amount: number) {
    // Billing service cost
    const billingPayload: BillingServiceCostRequestDto = {
      merchantId,
      productName: 'SMS',
      amount,
      transactionId: uuidv4(), // unique identifier
    };
    billingPayload['trackId'] = trackId;

    return billingPayload;
  }

  async verifyFlwPayment(paymentRequest: VerifyPaymentRequestDto) {
    const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);
    try {
      const response = await flw.Transaction.verify({ id: paymentRequest.transactionId });
      if (response.data == null) return response;

      if (response.data.status === "successful"
        && response.data.amount === paymentRequest.amount
        && response.data.currency === paymentRequest.currency) {
        // Success! Confirm the customer's payment
        return response;
      } else {
        // Inform the customer their payment was unsuccessful
        return response;
      }
    } catch (error) {
      return { status: 'error', data: null, message: error };
    }
  }

  async authenticate(trackId) {
    // Get token from cache
    this.purchaseSMSLog.getTokenLog(trackId);
    let token = await this.redis.get(AppConstants.SMS_API_BASE_PAY_AUTH_TOKEN);
    if (token) return token;

    // Get token from authentication service
    const params = new URLSearchParams({
      "grant_type": "client_credentials",
      "client_id": process.env.BASE_PAY_CLIENT_ID,
      "client_secret": process.env.BASE_PAY_CLIENT_SECRET,
    });

    // Send authentication request
    try {
      this.purchaseSMSLog.authenticateRequestLog(trackId, process.env.BASE_PAY_AUTH_URL);
      const { data } = await axios.post(process.env.BASE_PAY_AUTH_URL, params);
      this.purchaseSMSLog.authenticateResponseLog(trackId);

      const token = data.access_token;

      const expiryTime = 3300 // expire every 55 minutes
      if (token) this.redis.set(AppConstants.SMS_API_BASE_PAY_AUTH_TOKEN, token, expiryTime);

      return token;
    } catch (error) {
      return this.purchaseSMSLog.errorOccuredLog(trackId, error, 'Payment authentication');
    }
  }
}
