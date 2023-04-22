import { Injectable } from '@nestjs/common';

@Injectable()
export class SMSService {
  isItRunning(): string {
    return 'The app is up and running successfully...';
  }
}
