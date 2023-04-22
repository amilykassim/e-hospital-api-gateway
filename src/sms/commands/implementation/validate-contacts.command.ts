import { ContactsRequestDTO } from "src/sms/dto/contacts-validation-request.dto";

export class ValidateContactsCommand {
  constructor(
    public readonly request: ContactsRequestDTO
  ) { }
}