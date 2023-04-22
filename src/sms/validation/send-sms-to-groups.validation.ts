
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { SMSDto } from '../dto/send-sms-request.dto';
const Joi = require('joi');

@Injectable()
export class ValidateSendSmsToGroups implements PipeTransform {
  transform(sms: SMSDto, metadata: ArgumentMetadata) {
    const sendSmsSchema = Joi.object({
      title: Joi.string()
        .min(1)
        .max(11)
        .required(),
      message: Joi.string()
        .min(1)
        .required(),
      receiverGroups: Joi.array()
        .items(Joi.string().min(6).max(255).required())
        .min(1)
        .required(),
      contactListName: Joi.string()
        .min(1)
        .max(255),
      callbackUrl: Joi.string()
        .min(1)
        .max(2048),
      cron: Joi.string()
        .min(1)
        .max(255)
    });

    const { error } = sendSmsSchema.validate(sms);
    if (error) return { error: error.message };

    return sms;
  }
}