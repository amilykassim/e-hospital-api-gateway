import { Injectable } from '@nestjs/common';
import { CheckMyWalletSMSBalanceRequest } from '../dto/check-my-wallet-sms-balance.dto';
import { v4 as uuidv4 } from 'uuid';
import { CommandBus } from '@nestjs/cqrs';
import { WalletSMSBalanceCommand } from '../commands/implementation';
import { SendSMSLog } from '../logger/send-sms.logs';
import { RedisHelper } from '../utils/redis-helper';
require('dotenv').config();

@Injectable()
export class WalletBalance {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly redis: RedisHelper,
    private readonly sendSMSLog: SendSMSLog,
  ) { }
  
  async checkWalletSMSBalance(trackId: string, customerId: string) {
    // Check sms balance
    const smsBalanceRequest: CheckMyWalletSMSBalanceRequest = {
      merchantId: customerId,
      transactionId: uuidv4(),
      onlyCheckSMSWalletBalance: true,
    };
     smsBalanceRequest['trackId'] = trackId;
  
     // Dispatch checking sms balance command
     this.sendSMSLog.checkWalletSMSBalanceLog(smsBalanceRequest);
     await this.commandBus.execute(new WalletSMSBalanceCommand(smsBalanceRequest));
  }
}
