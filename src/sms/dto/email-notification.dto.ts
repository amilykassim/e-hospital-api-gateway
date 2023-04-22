import { ApiProperty } from "@nestjs/swagger";

export class EmailNotificationDTO {
  @ApiProperty({ description: "The customer ID" })
  statusCode: number;

  @ApiProperty({ description: "Username" })
  message: string;

  @ApiProperty({ description: "Email" })
  data: any;
}