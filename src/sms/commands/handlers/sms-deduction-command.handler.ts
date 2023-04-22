import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { SMSDeductionEvent } from '../../events/implementation';
import { SMSDeductionCommand } from '../implementation';

@CommandHandler(SMSDeductionCommand)
export class SMSDeductionCommandHandler implements ICommandHandler<SMSDeductionCommand> {
  constructor(
    private readonly eventBus: EventBus,
  ) { }

  async execute(command: SMSDeductionCommand) {
    const { smsDeduction } = command;
    this.eventBus.publish(new SMSDeductionEvent(smsDeduction));

    return { isPublished: true }; // used for unit tests
  }
}
