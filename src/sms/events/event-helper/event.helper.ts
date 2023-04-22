import { LogHelper } from './../../logger/log.helper';
import { Injectable } from "@nestjs/common";
import { StatusTrackingDto } from "src/sms/dto/status-tracking.dto";
import { KafkaHelper } from "../../utils/kafka-helper";

/**
 *
 * @author amilykassim
 */

@Injectable()
export class EventHelper {
  constructor(
    private readonly kafkaHelper: KafkaHelper,
  ) { }

  sendEvent(trackId: string, merchantId: string, message: string, metadata?: Object) {
    message = '[SMS API] ' + message; 
    // event status tracking payload
    const paymentRequestStatus: StatusTrackingDto = {
      trackId,
      merchantId,
      message,
      timestamp: new Date(),
      metadata
    }

    this.kafkaHelper.send(trackId, paymentRequestStatus, 'requestStatusTracking', process.env.REQUEST_STATUS_TRACKING_TOPIC);
  }

  sendActivityEvents(trackId: string, data: object, metadata?: Object) {
    this.kafkaHelper.send(trackId, data, 'activityStatusTracking', process.env.ACTIVITY_STATUS_TRACKING_TOPIC);
  }
}
