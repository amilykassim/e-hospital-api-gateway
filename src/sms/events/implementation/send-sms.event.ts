import { SMSGwDto } from "src/sms/dto/sms-gw.dto";

export class SendSmsEvent {
  constructor(
    public readonly sms: SMSGwDto,
  ) { }
}