import { EventHelper } from './../events/event-helper/event.helper';
import { Injectable } from "@nestjs/common";
import { KafkaHelper } from "../utils/kafka-helper";
import { AppConstants } from "./app.constants";
import { LogHelper } from "./log.helper";

/**
 *
 * @author amilykassim
 */

@Injectable()
export class RoutesLog {
  constructor(
    private readonly kafkaHelper: KafkaHelper,
    private readonly eventHelper: EventHelper,
  ) { }

  invalidRequestLog(request) {
    let args = {
      message: `Invalid request... ==> ${JSON.stringify(request)}`,
      '@timestamp': new Date(),
      trackId: request['trackId'],
      type: AppConstants.REQUEST_TYPE,
      threadName: 'validateRoutes()',
      eventId: '901',
    }
    LogHelper.logInfo(args);
  }

  incomingRequestLog(request) {
    let args = {
      message: `Received request... ==> ${JSON.stringify(request)}`,
      '@timestamp': new Date(),
      trackId: request['trackId'],
      type: AppConstants.REQUEST_TYPE,
      threadName: 'validateRoutes()',
      eventId: '901',
    }
    LogHelper.logInfo(args);
  }
  smsGwResponseLog(response) {
    let args = {
      message: `Received response from GW request... ==> ${JSON.stringify(response)}`,
      '@timestamp': new Date(),
      trackId: response['trackId'],
      type: AppConstants.REQUEST_TYPE,
      threadName: 'validateRoutes()',
      eventId: '901',
    }
    LogHelper.logInfo(args);
  }

  smsGwSenderIdResponseLog(response, request, user) {
    let args = {
      message: `Received response from GW request... ==> ${JSON.stringify(response)}`,
      '@timestamp': new Date(),
      trackId: response['trackId'],
      type: AppConstants.REQUEST_TYPE,
      threadName: 'validateRoutes()',
      eventId: '901',
    }
    LogHelper.logInfo(args);

    const pendingApprovalStatus = {
      customerid: response.customerId,
      campaignName: request.senderIds[0].title,
      customerName: user['preferred_username'],
      email: user.email,
      approvalStatus: "pending",
      timestamp: response.timestamp
    };

    const pendingApprovalActivityEvent = {
      verb: "requested",
      customerid: response.customerId,
      indirectObject: "",
      directObject: "for a campaign name approval",
      eventType: "NOTIFICATION",
      category: "NOTIFICATION",
      username: user['preferred_username'],
      timestamp: response.timestamp
    };

    if (response.statusCode === 200) {
      this.kafkaHelper.send(response.trackId, pendingApprovalStatus, 'requestStatusTracking', process.env.REQUEST_STATUS_TRACKING_TOPIC);
      this.eventHelper.sendActivityEvents(response.trackId, pendingApprovalActivityEvent)
    }
  }

  smsGwSenderIdResponseAdminLog(response, request) {
    let args = {
      message: `Received response from GW request... ==> ${JSON.stringify(response)}`,
      '@timestamp': new Date(),
      trackId: response['trackId'],
      type: AppConstants.REQUEST_TYPE,
      threadName: 'validateRoutes()',
      eventId: '901',
    }
    LogHelper.logInfo(args);

    const pendingApproval = {
      customerid: response.customerId,
      campaignName: request.title,
      customerName: request.customerName,
      email: request.email,
      approvalStatus: "pending",
      timestamp: response.timestamp
    };

    const pendingApprovalActivityEvent = {
      verb: "requested",
      customerid: response.customerId,
      indirectObject: "",
      directObject: "for a campaign name approval",
      eventType: "NOTIFICATION",
      category: "NOTIFICATION",
      username: request.customerName,
      timestamp: response.timestamp
    };

    if (response.statusCode === 200) {
      this.kafkaHelper.send(response.trackId, pendingApproval, 'requestStatusTracking', process.env.REQUEST_STATUS_TRACKING_TOPIC);
      this.eventHelper.sendActivityEvents(response.trackId, pendingApprovalActivityEvent)
    } 
  }

  smsGwSenderIdApprovedOrRejectedResponseAdminLog(response, request) {
    let args = {
      message: `Received response from GW request... ==> ${JSON.stringify(response)}`,
      '@timestamp': new Date(),
      trackId: response['trackId'],
      type: AppConstants.REQUEST_TYPE,
      threadName: 'validateRoutes()',
      eventId: '901',
    }
    LogHelper.logInfo(args);

    const pendingApproval = {
      trackId: response.trackId,
      merchantId: response.customerId,
      // campaignName: response.data.title,
      // customerName: response.data.customerName,
      // email: response.data.email,
      // approvalStatus: request.status.toLowerCase(),
      message: request.status.toLowerCase(),
      timestamp: response.timestamp
    };

    const pendingApprovalActivityEvent = {
      verb: request.status.toLowerCase(),
      customerid: response.customerId,
      indirectObject: "your",
      directObject: "campaign name request",
      eventType: "APPROVAL STATUS",
      category: "NOTIFICATION",
      username: response.data.customerName,
      timestamp: response.timestamp
    };

    if (response.statusCode === 200) {
      this.kafkaHelper.send(response.trackId, pendingApproval, 'requestStatusTracking', process.env.REQUEST_STATUS_TRACKING_TOPIC);
      this.eventHelper.sendActivityEvents(response.trackId, pendingApprovalActivityEvent)
    } 
  }
}
