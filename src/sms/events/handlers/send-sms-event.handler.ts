import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SmsRepository } from '../../repository/send-sms.repository';
import { SendSmsEvent } from '../implementation';
@EventsHandler(SendSmsEvent)
export class SendSmsEventHandler implements IEventHandler<SendSmsEvent> {
  constructor(private repository: SmsRepository) { }

  handle(event: SendSmsEvent) {
    const { sms } = event;
    return this.repository.sendSms(sms);
  }
}
