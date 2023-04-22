import { ApiProperty } from "@nestjs/swagger";

export class PaymentResponseDto {
  @ApiProperty({ description: "The merchant supplied transaction ID in the original request" })
  merchantTransactionId: string;

  @ApiProperty({ description: "Payer telephone number" })
  payerTelephoneNumber: string;

  @ApiProperty({ description: "Collected amount as paid by mobile money user." })
  collectedAmount: string;

  @ApiProperty({ description: "Currency symbol" })
  currency: string;

  @ApiProperty({ description: "Merchant message describing the transaction" })
  description: string;

  @ApiProperty({ description: "Transaction Id created by the mobile payment operator. Assists when supporting mobile payment users." })
  paymentProviderTransactionId: string;

  @ApiProperty({ description: "BasePay Transaction Id" })
  basePayTransactionId: string;

  @ApiProperty({ description: "Transaction Charged commission by BasePay" })
  transactionFee: string;

  @ApiProperty({ description: "200 if SUCCESS AND 401 if FAILED" })
  statusCode: string;

  @ApiProperty({ description: "TrackId of the request" })
  trackId: string;

  @ApiProperty({ description: "Payment callback" })
  callbackUrl: string;

  /**
   * "SUCCESS" "PAYER_ACCOUNT_NOT_FOUND" "COLLECTION_ATTEMPT_TIMEOUT" "PAYER_DECLINED_COLLECTION"
   *  "UNKNOWN_FAILURE" "PAYER_ENTERED_INVALID_PIN" "PAYER_ACCOUNT_NOT_ACTIVE" 
   * "PAYER_INUFFICIENT_FUNDS" "COLLECTION_BELOW_MINIMUM_ALLOWED_AMOUNT" 
   * "COLLECTION_ABOVE_MAXIMUM_ALLOWED_AMOUNT" "UNSUPPORTED_CURRENCY" "PENDING"
   *  "VALIDATION_FAILURE"
   */
  @ApiProperty({ description: "Descriptive application code showing transaction status." })
  status: string;
}
