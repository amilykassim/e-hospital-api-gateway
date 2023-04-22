
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { PurchaseSMSDto } from '../dto/purchase-sms-request.dto';
const Joi = require('joi');
require('dotenv').config()

@Injectable()
export class ValidateSMSPurchase implements PipeTransform {
  transform(buySMSRequest: PurchaseSMSDto, metadata: ArgumentMetadata) {
    // Set amount dynamically (if no amount provided use 8 as unit price for SMS)
    let amount = parseInt(process.env.AMOUNT);
    if (isNaN(amount)) amount = 8;

    const buySmsSchema = Joi.object({
      telephoneNumber: Joi.string()
        .min(6)
        .max(30)
        .required(),
      amount: Joi.number()
        .min(amount)
        .required()
    });

    const { error } = buySmsSchema.validate(buySMSRequest);
    if (error) return { error: error.message };

    return buySMSRequest;
  }
}