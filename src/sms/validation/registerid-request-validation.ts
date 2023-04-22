import { RegisterIDRequestDTO } from './../dto/registerid-request.dto';

import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
const Joi = require('joi');

@Injectable()
export class ValidateRegisterIDRequest implements PipeTransform {
  transform(request: RegisterIDRequestDTO, metadata: ArgumentMetadata) {
    let senderIdKeys = Joi.object().keys({
      title: Joi.string()
        .min(1)
        .max(11)
        .required(),
      smsType: Joi.string().valid('BULK', 'TRANSACTIONAL').required()
    });

    const schema = Joi.object({
      senderIds: Joi.array().items(senderIdKeys).min(1).required()
    });

    const { error } = schema.validate(request);
    if (error) return { error: error.message };

    return request;
  }
}