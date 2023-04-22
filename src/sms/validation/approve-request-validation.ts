import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { ApproveRequestDTO } from '../dto/approve-request.dto';
const Joi = require('joi');

@Injectable()
export class ValidateApproveRequest implements PipeTransform {
  transform(request: ApproveRequestDTO, metadata: ArgumentMetadata) {
    const schema = Joi.object({
      ids: Joi.array()
        .items(Joi.string().required())
        .min(1)
        .required()
    });

    const { error } = schema.validate(request);
    if (error) return { error: error.message };

    return request;
  }
}