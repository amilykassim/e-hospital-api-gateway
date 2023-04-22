import { SMSDeductionRequestDto } from "src/sms/dto/sms-deduction-request.dto";

export class SMSDeductionCommand {
  constructor(
    public readonly smsDeduction: SMSDeductionRequestDto
  ) { }
}