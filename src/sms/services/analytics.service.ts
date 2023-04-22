import { Injectable } from '@nestjs/common';
import axios from 'axios';
require('dotenv').config();

@Injectable()
export class AnalyticsService {
  async getBalance(customerId: string) {
    const query = `${process.env.ANALYTICS_BASE_URL}/load?query={ "dimensions": ["Smsbalance.customerid", "Smsbalance.balance", "Smsbalance.timestamp"],"filters": [{"dimension": "Smsbalance.customerid", "operator": "equals", "values": ["${customerId}"]}], "order": {"Smsbalance.timestamp": "desc"}, "limit":1}`;
    try {
      const { data } = await axios.get(query);
      return data.data
    } catch (e) {
      return []
    }
  }

  async getTimelineEvents(customerId: string) {
    const query = `${process.env.ANALYTICS_BASE_URL}/load?query={"dimensions":["Events.userid", "Events.username", "Events.eventtype",  "Events.redirectUrl", "Events.ipaddress", "Events.timestamp"],"filters": [{"dimension": "Events.userid", "operator": "equals", "values": ["${customerId}"]}], "order": {"Events.timestamp": "desc"}, "limit":1}`;
    try {
      const { data } = await axios.get(query);
      return data.data
    } catch (e) {
      return []
    }
  }

  async getPurchaseHistory(customerId: string) {
    const query = `${process.env.ANALYTICS_BASE_URL}/load?query={"dimensions":["PurchaseHistory.customerid", "PurchaseHistory.paymentStatus", "PurchaseHistory.amountPaid", "PurchaseHistory.smsBought", "PurchaseHistory.phoneNumber", "PurchaseHistory.timestamp"],"filters": [{"dimension": "PurchaseHistory.customerid", "operator": "equals", "values": ["${customerId}"]}], "order": {"PurchaseHistory.timestamp": "desc"}, "limit":1}`;
    try {
      const { data } = await axios.get(query);
      return data.data
    } catch (e) {
      return []
    }
  }

  async getCampaignHistory(customerId: string) {
    const query = `${process.env.ANALYTICS_BASE_URL}/load?query={"dimensions":["CampaignHistory.customerid", "CampaignHistory.campaignid", "CampaignHistory.campaignname", "CampaignHistory.numberofrecipients", "CampaignHistory.recipients", "CampaignHistory.mtnNumbers", "CampaignHistory.airtelNumbers", "CampaignHistory.deliveryrate", "CampaignHistory.status", "CampaignHistory.timestamp"],"filters": [{"dimension": "CampaignHistory.customerid", "operator": "equals", "values": ["${customerId}"]}], "order": {"CampaignHistory.timestamp": "desc"}}`;
    try {
      const { data } = await axios.get(query);
      return data.data
    } catch (e) {
      return []
    }
  }

  async getCampaignReport(customerId: string, campaignId: string) {
    const query = `${process.env.ANALYTICS_BASE_URL}/load?query={"dimensions":["CampaignReport.customerid",  "CampaignReport.campaignid", "CampaignReport.campaignname", "CampaignReport.totalrecipients", "CampaignReport.campaignLaunchTime", "CampaignReport.recipient", "CampaignReport.status", "CampaignReport.failureReason", "CampaignReport.telco", "CampaignReport.timeSent" ], "filters": [{"dimension": "CampaignReport.customerid", "operator": "contains", "values": ["${customerId}"]} , {"dimension": "CampaignReport.campaignid", "operator": "contains", "values": ["${campaignId}"]}], "order": {"CampaignReport.campaignLaunchTime": "desc"}}`;
    try {
      const { data } = await axios.get(query);
      return data.data
    } catch (e) {
      return []
    }
  }
}
