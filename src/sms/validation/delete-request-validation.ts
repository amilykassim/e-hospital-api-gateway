import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { ApproveRequestDTO } from '../dto/approve-request.dto';
const Joi = require('joi');

@Injectable()
export class ValidateDeleteSenderIdRequest implements PipeTransform {
  transform(request: ApproveRequestDTO, metadata: ArgumentMetadata) {
    const schema = Joi.object({
      id: Joi.string().required()
    });

    const { error } = schema.validate(request);
    if (error) return { error: error.message };

    return request;
  }
}