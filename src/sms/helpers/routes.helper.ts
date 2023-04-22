import { Injectable } from "@nestjs/common";
import { AuthenticatedUserDto } from "../dto/authenticated-user.dto";
import { v4 as uuidv4 } from 'uuid';
import { RoutesLog } from "../logger/routes.logs";

@Injectable()
export class RoutesHelper {
  constructor(
    private readonly routesLog: RoutesLog,
  ) { }
  validatePayload(request) {
    // check customer id
    if (request.customerId == undefined) {
      request['error'] = 'Customer Id is not provided in the token';
      this.routesLog.invalidRequestLog(request);
      return { statusCode: 400, error: request['error'] };
    }

    // Validate request payload with the help of validation pipeline
    if (request != undefined && request['error']) {
      this.routesLog.invalidRequestLog(request);
      return { statusCode: 400, error: request['error'] };
    }

    return null;
  }

  setTrackIdAndCustomerId(request, user: AuthenticatedUserDto) {
    const { customer_id } = user;
    request.trackId = uuidv4();
    request.customerId = customer_id;
  }

  setPersonalInfo(request) {
    const result = { senderIds: [] };

    for (const senderId of request.senderIds) {
      senderId.customerId = request.customerId;
      senderId.email = request.email;
      senderId.customerName = request.customerName
      result.senderIds.push(senderId);
    }
    return result;
  }

  removeCaseSensitive(search) {
    const result = { ...search };
    const { status, title, smsType } = result;
    result.status = (status) && status.trim().toUpperCase();
    result.title = (title) && title.trim().toUpperCase();
    result.smsType = (smsType) && smsType.trim().toUpperCase();

    return result;
  }
}
