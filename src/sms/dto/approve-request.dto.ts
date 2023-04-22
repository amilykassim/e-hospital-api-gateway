import { ApiProperty } from "@nestjs/swagger";

export class ApproveRequestDTO {
  customerId: string;
  status: string;
  id: string;
  trackId: string;
  metadata?: Object;
}
