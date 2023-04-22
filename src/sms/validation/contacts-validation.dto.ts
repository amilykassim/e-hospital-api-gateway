
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { ContactsRequestDTO } from '../dto/contacts-validation-request.dto';
const Joi = require('joi');

@Injectable()
export class ValidateContacts implements PipeTransform {
  transform(request: ContactsRequestDTO, metadata: ArgumentMetadata) {
    const schema = Joi.object({
      groupName: Joi.string()
        .min(1)
        .max(255)
        .required(),
      contacts: Joi.array()
        .items(Joi.object().required())
        .min(1)
        .max(2000)
        .required(),
      metadata: Joi.object()
    });

    const { error } = schema.validate(request);
    if (error) return { error: error.message };

    return request;
  }
}