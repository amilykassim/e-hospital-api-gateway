import { SMSGwDto } from "../dto/sms-gw.dto";
import { SMSDto } from "../dto/send-sms-request.dto";
export class SendSmsHelper {
  private static readonly telcos = [

    // airtel
    {
      telcoPrefix: '234701',
      bulkPrice: 3.18,
      transPrice: 3.46,
    },
    {
      telcoPrefix: '234708',
      bulkPrice: 3.18,
      transPrice: 3.46,
    },
    {
      telcoPrefix: '234802',
      bulkPrice: 3.18,
      transPrice: 3.46,
    },
    {
      telcoPrefix: '234808',
      bulkPrice: 3.18,
      transPrice: 3.46,
    },
    {
      telcoPrefix: '234812',
      bulkPrice: 3.18,
      transPrice: 3.46,
    },
    {
      telcoPrefix: '234902',
      bulkPrice: 3.18,
      transPrice: 3.46,
    },
    {
      telcoPrefix: '234907',
      bulkPrice: 3.18,
      transPrice: 3.46,
    },

    // 9mobile

    {
      telcoPrefix: '234809',
      bulkPrice: 2.69,
      transPrice: 3.73,
    },
    {
      telcoPrefix: '234817',
      bulkPrice: 2.69,
      transPrice: 3.73,
    },
    {
      telcoPrefix: '234818',
      bulkPrice: 2.69,
      transPrice: 3.73,
    },
    {
      telcoPrefix: '234908',
      bulkPrice: 2.69,
      transPrice: 3.73,
    },
    {
      telcoPrefix: '234909',
      bulkPrice: 2.69,
      transPrice: 3.73,
    },

    // glo
    {
      telcoPrefix: '234705',
      bulkPrice: 3.00,
      transPrice: 3.36,
    },
    {
      telcoPrefix: '234805',
      bulkPrice: 3.00,
      transPrice: 3.36,
    },
    {
      telcoPrefix: '234807',
      bulkPrice: 3.00,
      transPrice: 3.36,
    },
    {
      telcoPrefix: '234811',
      bulkPrice: 3.00,
      transPrice: 3.36,
    },
    {
      telcoPrefix: '234815',
      bulkPrice: 3.00,
      transPrice: 3.36,
    },
    {
      telcoPrefix: '234915',
      bulkPrice: 3.00,
      transPrice: 3.36,
    },
    {
      telcoPrefix: '234905',
      bulkPrice: 3.00,
      transPrice: 3.36,
    },



    // mtn
    {
      telcoPrefix: '2347025',
      bulkPrice: 3.48,
      transPrice: 3.40,
    },
    {
      telcoPrefix: '2347026',
      bulkPrice: 3.48,
      transPrice: 3.40,
    },
    {
      telcoPrefix: '234703',
      bulkPrice: 3.48,
      transPrice: 3.40,
    },
    {
      telcoPrefix: '234704',
      bulkPrice: 3.48,
      transPrice: 3.40,
    },
    {
      telcoPrefix: '234706',
      bulkPrice: 3.48,
      transPrice: 3.40,
    },
    {
      telcoPrefix: '234803',
      bulkPrice: 3.48,
      transPrice: 3.40,
    },
    {
      telcoPrefix: '234806',
      bulkPrice: 3.48,
      transPrice: 3.40,
    },
    {
      telcoPrefix: '234810',
      bulkPrice: 3.48,
      transPrice: 3.40,
    },
    {
      telcoPrefix: '234813',
      bulkPrice: 3.48,
      transPrice: 3.40,
    },
    {
      telcoPrefix: '234814',
      bulkPrice: 3.48,
      transPrice: 3.40,
    },
    {
      telcoPrefix: '234816',
      bulkPrice: 3.48,
      transPrice: 3.40,
    },
    {
      telcoPrefix: '234903',
      bulkPrice: 3.48,
      transPrice: 3.40,
    },
    {
      telcoPrefix: '234906',
      bulkPrice: 3.48,
      transPrice: 3.40,
    },

  ];
  static mapSmsDtoToSmsGwDto(sms: SMSDto): SMSGwDto {
    return {
      header: sms.title,
      message: sms.message,
      receiver: sms.receivers,
      customerId: sms.customerId,
      metadata: sms.metadata,
      trackId: sms.trackId,
      contactListName: sms.contactListName,
    };
  }

  static calculateHowManySmsNeededForKongaPay(sms, smsCount: number) {
    let smsNeeded = 0;
    for (let i = 0; i < sms.receivers.length; i++) {
      const phoneNumber = sms.receivers[i];
      for (let j = 0; j < this.telcos.length; j++) {
        const { telcoPrefix, bulkPrice, transPrice } = this.telcos[j];

        // transactional
        if (phoneNumber.startsWith(telcoPrefix) && (sms.title.toLowerCase() === 'kongapay')) {
          smsNeeded += transPrice;
        }
        // bulk
        if (phoneNumber.startsWith(telcoPrefix) && (sms.title.toLowerCase() === 'kongapay-ag')) {
          smsNeeded += bulkPrice;
        }
      }
    }

    smsNeeded *= smsCount;
    return smsNeeded;
  }

  static calculateSmsToDeductForKongaPay(sms) {
    const characterCount = sms.metadata.numberOfSmsToDeduct;
    const senderId = sms.sender;
    for (let i = 0; i < this.telcos.length; i++) {
      const { telcoPrefix, bulkPrice, transPrice } = this.telcos[i];

      // transactional
      if (sms.receiver.startsWith(telcoPrefix) && (senderId === 'KongaPay')) {
        return transPrice * characterCount;
      }
      // bulk
      if (sms.receiver.startsWith(telcoPrefix) && (senderId === 'KongaPay-AG')) {
        return bulkPrice * characterCount;
      }
    }
    return 0;
  }
}
