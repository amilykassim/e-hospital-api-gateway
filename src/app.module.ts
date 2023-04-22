import { AuthModule } from './authentication/keycloak.module';
import { Module } from '@nestjs/common';
import { SMSModule } from './sms/sms.module';

@Module({
  imports: [SMSModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
