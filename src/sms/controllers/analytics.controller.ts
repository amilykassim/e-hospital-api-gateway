import { Controller, Get, Headers, Query, Res } from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';
import { AuthenticatedUser, RoleMatchingMode, Roles } from 'nest-keycloak-connect';
import { AuthenticatedUserDto } from '../dto/authenticated-user.dto';
import { AnalyticsLog } from '../logger/analytics';
import { v4 as uuidv4 } from 'uuid';
require('dotenv').config();

@Controller('/api/v1/sms')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly analyticsLog: AnalyticsLog,
  ) { }

  @Get('/balance')
  @Roles({ roles: ['user'], mode: RoleMatchingMode.ANY })
  async getSmsBalance(@AuthenticatedUser() user: AuthenticatedUserDto, @Query() query: any, @Res() res) {
    let { customer_id } = user;
    const trackId = uuidv4();

    // if no customerId provided in the payload, use the one in the token
    if (query.customerId) customer_id = query.customerId

    if (customer_id == undefined) return res.status(400).json({ statusCode: 400, error: 'Customer Id is not provided in the token' });

    this.analyticsLog.checkWalletSMSBalance(trackId, customer_id);
    const result = await this.analyticsService.getBalance(customer_id);

    if (result.length == 0) {
      this.analyticsLog.invalidWalletSMSBalanceLog(trackId, customer_id, result);
      return res.status(404).json({ statusCode: 404, message: "Unable to get balance. Please try again later. If the problem persists please contact Oltranz support team." });
    }

    const balance = result[0]['Smsbalance.balance']

    this.analyticsLog.walletSMSBalanceLog(trackId, customer_id, balance);
    return res.status(200).json({ statusCode: 200, data: { balance } });
  }

  @Get('/timelineEventsHistory')
  @Roles({ roles: ['user'], mode: RoleMatchingMode.ANY })
  async getTimelineEvents(@AuthenticatedUser() user: AuthenticatedUserDto, @Res() res) {
    // Check customer id
    const { customer_id } = user;
    if (customer_id == undefined) return res.status(400).json({ statusCode: 400, error: 'Customer Id is not provided in the token' });

    const result = await this.analyticsService.getTimelineEvents(customer_id);

    // check if there is data
    if (result.length == 0) {
      return res.status(404).json({ statusCode: 404, message: "You have no timeline events history. Please try again later. If the problem persists please contact Oltranz support team." });
    }

    // extract data
    const data = [];
    for (const object of result) {
      const myData = {
        customerId: object['Events.userid'],
        customerName: object['Events.username'],
        eventType: object['Events.eventtype'],
        redirectUrl: object['Events.redirectUrl'],
        ipAddress: object['Events.ipaddress'],
        time: object['Events.timestamp'],
      }

      data.push(myData);
    }

    return res.status(200).json({ statusCode: 200, data });
  }

  @Get('/purchaseHistory')
  @Roles({ roles: ['user'], mode: RoleMatchingMode.ANY })
  async getPurchaseHistory(@AuthenticatedUser() user: AuthenticatedUserDto, @Res() res) {
    // Check customer id
    const { customer_id } = user;
    if (customer_id == undefined) return res.status(400).json({ statusCode: 400, error: 'Customer Id is not provided in the token' });

    const result = await this.analyticsService.getPurchaseHistory(customer_id);

    // check if there is data
    if (result.length == 0) {
      return res.status(404).json({ statusCode: 404, message: "You have no purchase history. Please try again later. If the problem persists please contact Oltranz support team." });
    }

    // extract data
    const data = [];
    for (const object of result) {
      const myData = {
        customerId: object['PurchaseHistory.customerid'],
        paymentStatus: object['PurchaseHistory.paymentStatus'],
        amountPaid: object['PurchaseHistory.amountPaid'],
        phoneNumber: object['PurchaseHistory.phoneNumber'],
        smsBought: object['PurchaseHistory.smsBought'],
        time: object['PurchaseHistory.timestamp'],
      }

      data.push(myData);
    }

    return res.status(200).json({ statusCode: 200, data });
  }

  @Get('/campaignHistory')
  @Roles({ roles: ['user'], mode: RoleMatchingMode.ANY })
  async getCampaignHistory(@AuthenticatedUser() user: AuthenticatedUserDto, @Res() res) {
    // Check customer id
    const { customer_id } = user;
    if (customer_id == undefined) return res.status(400).json({ statusCode: 400, error: 'Customer Id is not provided in the token' });

    const result = await this.analyticsService.getCampaignHistory(customer_id);

    // check if there is data
    if (result.length == 0) {
      return res.status(404).json({ statusCode: 404, message: "You have no campaign history. Please try again later. If the problem persists please contact Oltranz support team." });
    }

    // extract data
    const data = [];
    for (const object of result) {
      const myData = {
        customerId: object['CampaignHistory.customerid'],
        campaignId: object['CampaignHistory.campaignid'],
        campaignName: object['CampaignHistory.campaignname'],
        numberOfRecipients: object['CampaignHistory.numberofrecipients'],
        recipients: object['CampaignHistory.recipients'],
        mtnNumbers: object['CampaignHistory.mtnNumbers'],
        airtelNumbers: object['CampaignHistory.airtelNumbers'],
        deliveryRate: object['CampaignHistory.deliveryrate'],
        status: object['CampaignHistory.status'],
        time: object['CampaignHistory.timestamp'],
      }

      data.push(myData);
    }

    return res.status(200).json({ statusCode: 200, data });
  }

  @Get('/campaignReport')
  @Roles({ roles: ['user'], mode: RoleMatchingMode.ANY })
  async getCampaignReport(@AuthenticatedUser() user: AuthenticatedUserDto, @Headers() headers, @Res() res) {
    // Check campaign id
    const { campaignid } = headers;
    if (campaignid == undefined) return res.status(400).json({ code: 400, error: 'Campaign Id is not provided in the header' });

    // Check customer id
    const { customer_id } = user;
    if (customer_id == undefined) return res.status(400).json({ code: 400, error: 'Customer Id is not provided in the token' });

    const result = await this.analyticsService.getCampaignReport(customer_id, campaignid);

    // check if there is data
    if (result.length == 0) {
      return res.status(404).json({ statusCode: 404, message: "You have no campaign report. Please try again later. If the problem persists please contact Oltranz support team." });
    }

    // extract data
    const data = [];
    for (const object of result) {
      const myData = {
        campaignId: object['CampaignReport.campaignid'],
        campaignName: object['CampaignReport.campaignname'],
        totalRecipients: object['CampaignReport.totalrecipients'],
        campaignLaunchTime: object['CampaignReport.campaignLaunchTime'],
        recipient: object['CampaignReport.recipient'],
        status: object['CampaignReport.status'],
        failureReason: object['CampaignReport.failureReason'],
        telco: object['CampaignReport.telco'],
        timeSent: object['CampaignReport.timeSent'],
      }

      data.push(myData);
    }

    return res.status(200).json({ statusCode: 200, data });
  }
}
