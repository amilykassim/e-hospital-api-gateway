
import { WalletCreationRequestDto } from '../dto/wallet-creation-request.dto';
const Joi = require('joi');
require('dotenv').config()
export class ValidateWalletCreation {
  static validateCreatewalletPayload(wallet: WalletCreationRequestDto) {
    const createWalletSchema = Joi.object({
      type: Joi.string()
        .min(1)
        .max(255)
        .required(),
      ownerId: Joi.string()
        .min(1)
        .max(255)
        .required(),
      ownerName: Joi.string()
        .min(1)
        .max(255)
        .required(),
      email: Joi.string()
        .email()
        .required(),
      phone: Joi.string()
        .min(6)
        .max(255)
        .required(),
    });

    return createWalletSchema.validate(wallet);
  }
}