
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { ContactsRequestDTO } from '../dto/contacts-validation-request.dto';
const Joi = require('joi');

@Injectable()
export class UpdateContactDetailsValidation implements PipeTransform {
  transform(request: ContactsRequestDTO, metadata: ArgumentMetadata) {
    const schema = Joi.object({
      firstName: Joi.string()
        .min(1)
        .max(255),
      lastName: Joi.string()
        .min(1)
        .max(255),
      email: Joi.string().email()
        .min(1)
        .max(255),
      profileImage: Joi.string()
        .min(1)
        .max(2083),
      metadata: Joi.object()
    });

    const { error } = schema.validate(request);
    if (error) return { error: error.message };

    return request;
  }
}