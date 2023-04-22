import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { SendSmsEvent } from '../../events/implementation';
import { SendSMSCommand } from '../implementation';

@CommandHandler(SendSMSCommand)
export class SendSMSCommandHandler implements ICommandHandler<SendSMSCommand> {
  constructor(
    private readonly eventBus: EventBus,
  ) { }

  async execute(command: SendSMSCommand) {
    const { sms } = command;
    this.eventBus.publish(new SendSmsEvent(sms));

    return { isPublished: true }; // used for unit tests
  }
}
