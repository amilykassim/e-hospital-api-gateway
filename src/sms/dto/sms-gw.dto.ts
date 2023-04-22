import { InputType, Field } from "@nestjs/graphql";
import { ApiProperty } from "@nestjs/swagger";

@InputType()
export class SMSGwDto {
  @Field()
  @ApiProperty()
  header: string;

  @Field()
  @ApiProperty()
  message: string;

  @Field()
  @ApiProperty()
  receiver: [string];

  @Field()
  @ApiProperty({ description: "Contact list name" })
  contactListName?: string;

  @Field()
  @ApiProperty()
  customerId: string;

  @Field()
  @ApiProperty()
  trackId: string;

  @ApiProperty({ description: "Metadata" })
  metadata?: Object;
}
