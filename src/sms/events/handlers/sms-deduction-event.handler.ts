import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SMSDeductionRepository } from '../../repository/sms-deduction.repository';
import { SMSDeductionEvent } from '../implementation';

@EventsHandler(SMSDeductionEvent)
export class SMSDeductionEventHandler implements IEventHandler<SMSDeductionEvent> {
  constructor(private repository: SMSDeductionRepository) { }

  handle(event: SMSDeductionEvent) {
    const { smsDeduction } = event;

    return this.repository.deductSMS(smsDeduction);
  }
}
