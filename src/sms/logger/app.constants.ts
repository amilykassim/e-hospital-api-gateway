/**
   * 
   *  @author amilykassim
   * 
   * */
export class AppConstants {
  // log numbering
  static STEP: number = 1;

  // logs constant
  static readonly APPLICATION_NAME: string = 'SMS API';
  static readonly HTTP_PROTOCOL: string = 'http';
  static readonly KAFKA_PROTOCOL: string = 'kafka';
  static readonly REQUEST_TYPE: string = 'request';
  static readonly RESPONSE_TYPE: string = 'response';
  static readonly METHOD_CALL_TYPE: string = 'methodCall';
  static readonly SMS_PROCESSED_API_DEDUCTION_REQUEST: string = 'sms-processed-api-deduction-request';
  static readonly SMS_PROCESSED_API_WALLET_BALANCE_RESPONSE: string = 'sms-processed-api-wallet-balance-response';
  static readonly SMS_API_BASE_PAY_AUTH_TOKEN: string = 'sms-api-base-pay-auth-token';
}
