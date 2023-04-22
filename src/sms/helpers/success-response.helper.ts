import { Injectable } from "@nestjs/common";
import { EventHelper } from "../events/event-helper/event.helper";
import { AppLogs } from "../logger/app.logs";

@Injectable()
export class MyCustomResponse {
  constructor(
    private readonly eventHelper: EventHelper,
  ) { }

  success(trackId: string, merchantId: string) {
    const message = 'Replied to the user that the Request has been received successfully and is currently being processed'
    this.eventHelper.sendEvent(trackId, merchantId, message);
    AppLogs.successResponseLog(trackId, message);
    return { statusCode: 200, message: 'Request received successfully and is currently being processed', trackId };
  }

  error(error: any) {
    return { statusCode: 400, error };
  }
}