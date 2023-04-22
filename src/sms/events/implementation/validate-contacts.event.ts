import { ContactsRequestDTO } from "src/sms/dto/contacts-validation-request.dto";

export class ValidateContactsEvent {
  constructor(
    public readonly request: ContactsRequestDTO,
  ) {}
}