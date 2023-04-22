import { ApiProperty } from "@nestjs/swagger";

export class SMSAllocationResponseDto {
  @ApiProperty({ description: "The transaction id, PS: should be a valid UUID" })
  transactionId: string;

  @ApiProperty({ description: "SUCCESS | FAILED" })
  status: string;
}
