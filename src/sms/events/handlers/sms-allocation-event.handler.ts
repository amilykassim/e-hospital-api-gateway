import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SMSAllocationRepository } from '../../repository/sms-allocation.repository';
import { SMSAllocationEvent } from '../implementation';

@EventsHandler(SMSAllocationEvent)
export class SMSAllocationEventHandler implements IEventHandler<SMSAllocationEvent> {
  constructor(private repository: SMSAllocationRepository) { }

  handle(event: SMSAllocationEvent) {
    const { smsAllocation } = event;
    return this.repository.allocateSMS(smsAllocation);
  }
}
