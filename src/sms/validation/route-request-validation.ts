
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { RouteRequestDTO } from '../dto/route-request.dto';
const Joi = require('joi');

@Injectable()
export class ValidateRouteRequest implements PipeTransform {
  transform(request: RouteRequestDTO, metadata: ArgumentMetadata) {
    const schema = Joi.object({
      topic: Joi.string()
        .min(1)
        .max(255)
        .required(),
      telcoPrefix: Joi.number(),
      phoneNumberLength: Joi.number().max(15).min(1).required(),
      title: Joi.string()
        .min(1)
        .max(255),
    });

    const { error } = schema.validate(request);
    if (error) return { error: error.message };

    return request;
  }
}