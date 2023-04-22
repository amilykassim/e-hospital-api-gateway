import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { SMSAllocationEvent } from '../../events/implementation';
import {SMSAllocationCommand } from '../implementation';

@CommandHandler(SMSAllocationCommand)
export class SMSAllocationCommandHandler implements ICommandHandler<SMSAllocationCommand> {
  constructor(
    private readonly eventBus: EventBus,
  ) { }

  async execute(command: SMSAllocationCommand) {
    const { smsAllocation } = command;
    this.eventBus.publish(new SMSAllocationEvent(smsAllocation));

    return { isPublished: true }; // used for unit tests
  }
}
