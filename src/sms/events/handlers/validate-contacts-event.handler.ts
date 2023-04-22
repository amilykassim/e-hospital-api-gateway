import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ValidateContactsRepository } from '../../repository/validate-contacts.repository';
import { ValidateContactsEvent } from '../implementation';
@EventsHandler(ValidateContactsEvent)
export class ValidateContactsEventHandler implements IEventHandler<ValidateContactsEvent> {
  constructor(private repository: ValidateContactsRepository) { }

  handle(event: ValidateContactsEvent) {
    const { request } = event;
    return this.repository.send(request);
  }
}
