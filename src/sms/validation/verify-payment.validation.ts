import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { VerifyPaymentRequestDto } from '../dto/verify-payment-request.dto';
const Joi = require('joi');

@Injectable()
export class ValidatePaymentVerificationPayload implements PipeTransform {
  transform(request: VerifyPaymentRequestDto, metadata: ArgumentMetadata) {
    const requestSchema = Joi.object({
      transactionRef: Joi.string().min(1).max(255).required(),
      transactionId: Joi.string().min(1).max(255).required(),
      amount: Joi.number().min(1).required(),
      status: Joi.string().min(1).max(255).required(),
      currency: Joi.string().min(1).max(5).required(),
    });

    const { error } = requestSchema.validate(request);
    if (error) return { error: error.message };

    return request;
  }
}