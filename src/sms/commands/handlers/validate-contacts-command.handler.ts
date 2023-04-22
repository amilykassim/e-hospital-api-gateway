import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ValidateContactsEvent } from 'src/sms/events/implementation/validate-contacts.event';
import { SendSmsEvent } from '../../events/implementation';
import { ValidateContactsCommand } from '../implementation';

@CommandHandler(ValidateContactsCommand)
export class ValidateContactsCommandHandler implements ICommandHandler<ValidateContactsCommand> {
  constructor(
    private readonly eventBus: EventBus,
  ) { }

  async execute(command: ValidateContactsCommand) {
    const { request } = command;
    this.eventBus.publish(new ValidateContactsEvent(request));

    return { isPublished: true }; // used for unit tests
  }
}
