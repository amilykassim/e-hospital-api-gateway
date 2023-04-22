import { BillingServiceCostEventHandler } from "./billing-service-cost-event.handler";
import { BillingSubscriptionEventHandler } from "./billing-subscription-event.handler";
import { SendSmsEventHandler } from "./send-sms-event.handler";
import { SMSAllocationEventHandler } from "./sms-allocation-event.handler";
import { SMSDeductionEventHandler } from "./sms-deduction-event.handler";
import { ValidateContactsEventHandler } from "./validate-contacts-event.handler";
import { WalletCreationEventHandler } from "./wallet-creation-event.handler";
import { WalletSMSBalanceEventHandler } from "./wallet-sms-balance-event.handler";

export const EventHandlers = [
    SendSmsEventHandler,
    WalletCreationEventHandler,
    BillingServiceCostEventHandler,
    BillingSubscriptionEventHandler,
    SMSAllocationEventHandler,
    WalletSMSBalanceEventHandler,
    SMSDeductionEventHandler,
    ValidateContactsEventHandler
];
