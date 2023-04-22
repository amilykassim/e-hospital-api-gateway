import { Module } from '@nestjs/common';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { MedicalModule } from './modules/medical/medical.module';

@Module({
  imports: [AuthenticationModule, MedicalModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
