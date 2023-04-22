import { BillingServiceCostCommandHandler } from "./billing-service-cost-command.handler";
import { BillingSubscriptionCommandHandler } from "./billing-subscription-command.handler";
import { SendSMSCommandHandler } from "./send-sms-command.handler";
import { SMSAllocationCommandHandler } from "./sms-allocation-command.handler";
import { SMSDeductionCommandHandler } from "./sms-deduction-command.handler";
import { ValidateContactsCommandHandler } from "./validate-contacts-command.handler";
import { WalletCreationCommandHandler } from "./wallet-creation-command.handler";
import { WalletSMSBalanceCommandHandler } from "./wallet-sms-balance-command.handler";

export const CommandHandlers = [
    SendSMSCommandHandler,
    WalletCreationCommandHandler,
    BillingServiceCostCommandHandler,
    BillingSubscriptionCommandHandler,
    SMSAllocationCommandHandler,
    WalletSMSBalanceCommandHandler,
    SMSDeductionCommandHandler,
    ValidateContactsCommandHandler
];
