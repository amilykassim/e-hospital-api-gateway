import { SMSDeductionRequestDto } from "src/sms/dto/sms-deduction-request.dto";

export class SMSDeductionEvent {
  constructor(
    public readonly smsDeduction: SMSDeductionRequestDto,
  ) { }
}
