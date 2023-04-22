import { AppConstants } from "./app.constants";
import { LogHelper } from "./log.helper";

/**
 *
 * @author amilykassim
 */
export class AppLogs {
  static producerConnectedLog() {
    let args = {
      message: `kafka connected successfully`,
      '@timestamp': new Date(),
      traceId: '',
      type: '',
      threadName: 'SmsRepository()',
      eventId: '901',
    };
    LogHelper.logInfo(args);
  }

  static sendDataToKafkaLog(trackId, sms, transactionName: string, message: string) {
    let args = {
      message: `Send data to kafka for ${transactionName} ==> ${message}`,
      '@timestamp': new Date(),
      trackId: trackId,
      type: AppConstants.REQUEST_TYPE,
      threadName: 'send()',
      eventId: '901',
    };
    LogHelper.logInfo(args);
  }

  static successResponseLog(trackId: string, message: string) {
    let args = {
      message,
      '@timestamp': new Date(),
      trackId: trackId,
      type: AppConstants.REQUEST_TYPE,
      threadName: '',
      eventId: '901',
    };
    LogHelper.logInfo(args);
  }

  static unexpectedErrorWhileSendingDataToKafka(error) {
    console.log(
      'Unexpected error occured while sending data to kafka, here is the reason: ',
      error,
    );
  }
}
