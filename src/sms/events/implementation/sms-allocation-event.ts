import { SMSAllocationRequestDto } from "src/sms/dto/sms-allocation-request.dto";

export class SMSAllocationEvent {
  constructor(
    public readonly smsAllocation: SMSAllocationRequestDto,
  ) { }
}
