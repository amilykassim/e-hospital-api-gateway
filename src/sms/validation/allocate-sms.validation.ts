
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { AdminSMSAllocationRequestDto } from '../dto/admin-sms-allocation-request.dto';
const Joi = require('joi');
require('dotenv').config()

@Injectable()
export class ValidateSMSAllocation implements PipeTransform {
  transform(allocateSMSRequest: AdminSMSAllocationRequestDto, metadata: ArgumentMetadata) {
    const allocateSmsSchema = Joi.object({
      merchantId: Joi.string()
        .min(6)
        .max(255)
        .required(),
      numberOfSMS: Joi.number()
        .min(1)
        .required(),
      amountPaid: Joi.number()
        .min(1)
        .required(),
      email: Joi.string().email().required()
    });

    const { error } = allocateSmsSchema.validate(allocateSMSRequest);
    if (error) return { error: error.message };

    return allocateSMSRequest;
  }
}