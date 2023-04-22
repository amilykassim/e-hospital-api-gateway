import { RegisterIDRequestDTO } from '../dto/registerid-request.dto';

import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
const Joi = require('joi');

@Injectable()
export class ValidateRegisterIDRequestAdmin implements PipeTransform {
  transform(request: RegisterIDRequestDTO, metadata: ArgumentMetadata) {
    let senderIdKeys = Joi.object().keys({
      title: Joi.string()
        .min(1)
        .max(11)
        .required(),
      customerId: Joi.string()
        .min(1)
        .max(255)
        .required(),
      customerName: Joi.string().min(1).max(255).required(),
      email: Joi.string().email().required(),
      smsType: Joi.string().valid('BULK', 'TRANSACTIONAL').required()
    });

    const isCommonSenderId = request['senderIds'][0].isCommon;
    const schema = Joi.object({
      senderIds: Joi.array().items(isCommonSenderId ? this.getCommonSenderIdKeys() : senderIdKeys).min(1).required()
    });

    const { error } = schema.validate(request);
    if (error) return { error: error.message };

    return request;
  }

  getCommonSenderIdKeys() {
    return Joi.object().keys({
      title: Joi.string()
        .min(1)
        .max(11)
        .required(),
      smsType: Joi.string().valid('BULK', 'TRANSACTIONAL').required(),
      isCommon: Joi.string().valid('true', 'false').required(),
    });
  }
}