import { SMSAllocationRequestDto } from "src/sms/dto/sms-allocation-request.dto";

export class SMSAllocationCommand {
  constructor(
    public readonly smsAllocation: SMSAllocationRequestDto
  ) { }
}