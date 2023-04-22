import { ApiProperty } from "@nestjs/swagger";

export class VerifyPaymentRequestDto {
  transactionRef: string;
  transactionId: string;
  amount: number;
  status: string;
  merchantId: string;
  email: string;
  currency: string;
}
