import { AppConstants } from './app.constants';
import { ApmService } from 'nestjs-apm-v6';
const { v4: uuidv4 } = require('uuid');

/**
 *
 * @author amilykassim
 */
export class LogHelper {
  private static apmService: ApmService;
  /**
   * Format and Log info message
   *
   * This method is called for Formating and Logging info message
   *
   * @param log       logger to be used for logging the message
   * @param message   The data to be logged
   * @return
   */
  static logInfo(args: any) {
    const data = {
      id: uuidv4(),
      '@timestamp': new Date(),
      trackId: args.trackId,
      level: 'info',
      applicationName: AppConstants.APPLICATION_NAME,
      protocol: AppConstants.KAFKA_PROTOCOL,
      type: args.type,
      message: args.message,
      threadName: args.threadName,
      eventId: args.eventId,
      metadata: args.metadata,
    }
    console.log(`${JSON.stringify(data)}`);
  }

  /**
   * Format and Log error message
   *
   * This method is called for Formating and Logging error message
   *
   * @param log       logger to be used for logging the message
   * @param message   The data to be logged
   * @return
   */
  static logError(args: any, error?: any) {
    const data = {
      id: uuidv4(),
      '@timestamp': new Date(),
      trackId: args.trackId,
      level: 'error',
      applicationName: AppConstants.APPLICATION_NAME,
      protocol: AppConstants.KAFKA_PROTOCOL,
      type: args.type,
      message: args.message,
      threadName: args.threadName,
      eventId: args.eventId,
      metadata: args.metadata,
    }
    console.log(`${JSON.stringify(data)}`);

    // send error to APM server
    try {
      LogHelper.apmService.captureError(error);
      console.log('Sent the error to APM server successfully')
    } catch (error) {
      console.log('Failed to send the error to APM server');
    }
  }

  static log(name, data) {
    console.log(`\n\n ${name} ->>>>>`, data);
    console.log('\n');
  }
}
