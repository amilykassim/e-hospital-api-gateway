import { SMSGwDto } from "src/sms/dto/sms-gw.dto";

export class SendSMSCommand {
  constructor(
    public readonly sms: SMSGwDto
  ) { }
}